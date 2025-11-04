'use client';

import { useState } from 'react';
import axios from 'axios';
import { RequestData } from '@/utils/crawler';

export default function CrawlerPage() {
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, '0')}`;

  const [startMonth, setStartMonth] = useState('2021-07');
  const [endMonth, setEndMonth] = useState(currentMonth);

  const [data, setData] = useState<RequestData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFetch = async () => {
    setLoading(true);
    setError('');
    setData(null);

    if (new Date(startMonth) > new Date(endMonth)) {
      setError('시작 월이 종료 월보다 늦을 수 없습니다.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get<RequestData[]>(
        `/api/requests?start=${startMonth}&end=${endMonth}`
      );
      setData(response.data);
      setLoading(false);
    } catch (err: unknown) {
      let errorMsg = '네트워크 요청 실패';
      if (
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response &&
        err.response.data &&
        typeof err.response.data === 'object'
      ) {
        type AxiosErrorResponse = { error?: unknown };
        const responseData = err.response.data as AxiosErrorResponse;
        errorMsg =
          typeof responseData.error === 'string'
            ? responseData.error
            : '알 수 없는 오류 발생';
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const totalRequests =
    data?.reduce((sum: number, item: RequestData) => sum + item.requests, 0) ??
    0;

  return (
    <div className='container mx-auto p-8'>
      <h1 className='text-3xl font-bold mb-6'>📅 크롤링 데이터 요청</h1>
      <div className='flex space-x-4 mb-8'>
        <input
          type='month'
          value={startMonth}
          onChange={(e) => setStartMonth(e.target.value)}
          className='p-2 border border-gray-300 rounded'
        />
        <span>~</span>
        <input
          type='month'
          value={endMonth}
          onChange={(e) => setEndMonth(e.target.value)}
          className='p-2 border border-gray-300 rounded'
        />
        <button
          onClick={handleFetch}
          disabled={loading}
          className='bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400'
        >
          {loading ? '데이터 처리 중...' : '데이터 요청'}
        </button>
      </div>

      {error && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
          오류: {error}
        </div>
      )}

      {data && data.length > 0 && (
        <div className='mt-8'>
          <h2 className='text-xl font-bold mb-4'>
            총 요약: ({startMonth} ~ {endMonth}){' '}
            {totalRequests.toLocaleString()} 회
          </h2>
          {/* ... (테이블 표시 로직 유지) */}
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200 border'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    월
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    날짜
                  </th>
                  <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    요청 수
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {data.map((item: RequestData) => (
                  <tr
                    key={item.day}
                    className={item.requests === 0 ? 'bg-yellow-50' : ''}
                  >
                    <td className='px-6 py-4 whitespace-nowrap font-medium text-gray-900'>
                      {item.day.substring(5, 7)}월
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {item.day}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-right font-bold'>
                      {item.requests === 0
                        ? '데이터 없음/파싱 실패'
                        : item.requests.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <hr className='my-8' />
    </div>
  );
}
