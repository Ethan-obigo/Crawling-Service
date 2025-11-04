// components/ExcelDownloader.tsx
'use client';

import React from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { RequestData } from '@/utils/crawler';

interface ExcelDownloaderProps {
  data: RequestData[];
  startMonth: string;
  endMonth: string;
}

const ExcelDownloader: React.FC<ExcelDownloaderProps> = ({
  data,
  startMonth,
  endMonth,
}) => {
  const handleDownload = async () => {
    const groupedData: { [year: number]: RequestData[] } = data.reduce(
      (acc, item) => {
        const year = parseInt(item.day.substring(0, 4), 10);
        if (!acc[year]) {
          acc[year] = [];
        }
        acc[year].push(item);
        return acc;
      },
      {} as { [year: number]: RequestData[] }
    );

    const requestMap = new Map(
      data.map((item) => [item.day.replace(/-/g, ''), item.requests])
    );

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(
      `${startMonth}_to_${endMonth}_Report`
    );

    let currentRow = 3;

    const sortedYears = Object.keys(groupedData)
      .map(Number)
      .sort((a, b) => a - b);

    const borderStyle: Partial<ExcelJS.Border> = {
      style: 'thin',
      color: { argb: 'FF000000' },
    };

    const alignmentStyle: Partial<ExcelJS.Alignment> = {
      horizontal: 'right',
      vertical: 'middle',
    };

    for (const startYear of sortedYears) {
      const endYear = startYear + 1;

      const dateRowData: number[] = [];
      const requestRowData: number[] = [];

      for (let month = 7; month <= 12; month++) {
        const monthStr = String(month).padStart(2, '0');
        const dateKey = `${startYear}${monthStr}`;
        const requests = requestMap.get(dateKey) ?? 0;

        dateRowData.push(parseInt(dateKey, 10));
        requestRowData.push(requests);
      }

      for (let month = 1; month <= 6; month++) {
        const monthStr = String(month).padStart(2, '0');
        const dateKey = `${endYear}${monthStr}`;
        const requests = requestMap.get(dateKey) ?? 0;

        dateRowData.push(parseInt(dateKey, 10));
        requestRowData.push(requests);
      }

      const dateRow = worksheet.getRow(currentRow);
      dateRowData.forEach((dateValue, index) => {
        const cell = dateRow.getCell(index + 2);
        cell.value = dateValue;
        cell.alignment = alignmentStyle;
        cell.border = {
          top: borderStyle,
          bottom: borderStyle,
          left: borderStyle,
          right: borderStyle,
        };
      });
      currentRow++;

      const requestRow = worksheet.getRow(currentRow);
      requestRowData.forEach((requestValue, index) => {
        const cell = requestRow.getCell(index + 2);
        cell.value = requestValue;
        cell.alignment = alignmentStyle;
        cell.border = {
          top: borderStyle,
          bottom: borderStyle,
          left: borderStyle,
          right: borderStyle,
        };
      });
      currentRow++;
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const fileName = `monthly_requests_${startMonth}_to_${endMonth}_report.xlsx`;
    saveAs(blob, fileName);
  };

  return (
    <button
      onClick={handleDownload}
      className='bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition cursor-pointer'
      disabled={data.length === 0}
    >
      📥 엑셀로 다운로드 (월간 보고서)
    </button>
  );
};

export default ExcelDownloader;
