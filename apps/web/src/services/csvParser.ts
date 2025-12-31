/**
 * CSV 解析服务
 * 使用 papaparse 解析 CSV 文件
 * 支持自动检测日期格式和列类型
 */

import Papa from 'papaparse';
import type { Dataset, ColumnType, CsvParseResult } from '@/types/chart';
import { nanoid } from 'nanoid';

/**
 * 常见日期格式正则表达式
 */
const DATE_PATTERNS: { regex: RegExp; name: string }[] = [
  // ISO-8601: 2024-01-15T10:30:00Z, 2024-01-15T10:30:00.000Z
  { regex: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z?$/, name: 'ISO-8601' },
  // YYYY-MM-DD: 2024-01-15
  { regex: /^\d{4}-\d{2}-\d{2}$/, name: 'YYYY-MM-DD' },
  // MM/DD/YYYY: 01/15/2024
  { regex: /^\d{2}\/\d{2}\/\d{4}$/, name: 'MM/DD/YYYY' },
  // DD/MM/YYYY: 15/01/2024 (欧洲格式)
  { regex: /^\d{2}\/\d{2}\/\d{4}$/, name: 'DD/MM/YYYY' },
  // YYYY/MM/DD: 2024/01/15 (日本格式)
  { regex: /^\d{4}\/\d{2}\/\d{2}$/, name: 'YYYY/MM/DD' },
];

/**
 * 检查字符串是否是日期格式
 */
function isDateString(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  
  // 检查是否匹配任何日期格式
  for (const pattern of DATE_PATTERNS) {
    if (pattern.regex.test(trimmed)) {
      // 尝试解析日期确保有效
      const parsed = new Date(trimmed);
      if (!isNaN(parsed.getTime())) {
        return true;
      }
    }
  }
  return false;
}

/**
 * 检查值是否是数值类型
 */
function isNumericValue(value: unknown): boolean {
  if (value === null || value === undefined || value === '') return false;
  const numValue = Number(value);
  return !isNaN(numValue) && isFinite(numValue);
}

/**
 * 检测单列的数据类型
 * 基于采样数据推断类型
 * @param values 该列的值数组
 * @returns 检测到的列类型
 */
function detectColumnType(values: unknown[]): ColumnType {
  // 过滤掉空值
  const nonEmptyValues = values.filter(v => v !== null && v !== undefined && v !== '');
  
  if (nonEmptyValues.length === 0) {
    return 'string';
  }
  
  // 计算类型统计
  let dateCount = 0;
  let numberCount = 0;
  
  for (const value of nonEmptyValues) {
    const strValue = String(value).trim();
    
    if (isDateString(strValue)) {
      dateCount++;
    } else if (isNumericValue(strValue)) {
      numberCount++;
    }
  }
  
  // 如果超过 80% 是日期，判定为日期类型
  if (dateCount / nonEmptyValues.length >= 0.8) {
    return 'date';
  }
  
  // 如果超过 80% 是数值，判定为数值类型
  if (numberCount / nonEmptyValues.length >= 0.8) {
    return 'number';
  }
  
  // 默认为字符串
  return 'string';
}

/**
 * 解析 CSV 文件内容
 * @param file 上传的文件对象
 * @returns Promise<Dataset> 解析后的数据集
 */
export async function parseCsvFile(file: File): Promise<Dataset> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false, // 保持原始字符串，由我们自己处理类型转换
      complete: (results: CsvParseResult) => {
        if (results.errors.length > 0) {
          // 仅报告严重错误，忽略行末空行等
          const criticalErrors = results.errors.filter(e => e.type !== 'FieldMismatch');
          if (criticalErrors.length > 0) {
            reject(new Error(`CSV 解析错误: ${criticalErrors[0].message}`));
            return;
          }
        }
        
        const headers = results.meta.fields || [];
        const data = results.data;
        
        if (headers.length === 0) {
          reject(new Error('CSV 文件没有有效的列标题'));
          return;
        }
        
        if (data.length === 0) {
          reject(new Error('CSV 文件没有数据行'));
          return;
        }
        
        // 检测每列的类型
        const columnTypes: Record<string, ColumnType> = {};
        for (const header of headers) {
          const columnValues = data.map(row => row[header]);
          columnTypes[header] = detectColumnType(columnValues);
        }
        
        // 根据类型转换数据
        const typedData = data.map(row => {
          const typedRow: Record<string, unknown> = {};
          for (const header of headers) {
            const value = row[header];
            const type = columnTypes[header];
            
            if (value === null || value === undefined || value === '') {
              typedRow[header] = null;
            } else if (type === 'number') {
              typedRow[header] = Number(value);
            } else if (type === 'date') {
              // 保持日期字符串格式，由图表组件处理
              typedRow[header] = String(value).trim();
            } else {
              typedRow[header] = String(value);
            }
          }
          return typedRow;
        });
        
        const dataset: Dataset = {
          id: nanoid(),
          fileName: file.name,
          fileSize: file.size,
          headers,
          data: typedData,
          columnTypes,
        };
        
        resolve(dataset);
      },
      error: (error: Error) => {
        reject(new Error(`CSV 解析失败: ${error.message}`));
      },
    });
  });
}

/**
 * 验证文件是否符合上传要求
 * @param file 上传的文件对象
 * @returns { valid: boolean, message?: string }
 */
export function validateCsvFile(file: File): { valid: boolean; message?: string } {
  // 检查文件大小 (10MB 限制)
  const MAX_SIZE = 10 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      message: `文件大小超过限制。最大允许 10MB，当前文件 ${(file.size / 1024 / 1024).toFixed(2)}MB`,
    };
  }
  
  // 检查文件类型
  const validTypes = ['text/csv', 'application/vnd.ms-excel'];
  const validExtension = file.name.toLowerCase().endsWith('.csv');
  
  if (!validTypes.includes(file.type) && !validExtension) {
    return {
      valid: false,
      message: '请上传 CSV 格式的文件',
    };
  }
  
  return { valid: true };
}
