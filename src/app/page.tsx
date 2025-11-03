'use client';

import { useState } from 'react';
import axios from 'axios';
import { RequestData } from '@/utils/crawler';

export default function CrawlerPage() {
  const [day, setDay] = useState('2024-04');
  const [data, setData] = useState<RequestData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFetch = async () => {
    setLoading(true);
    setError('');
    setData(null);

    try {
      const response = await axios.get<RequestData>(`/api/requests?day=${day}`);
      setData(response.data);
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
      }
      setError(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className='container mx-auto p-8'>
      <h1 className='text-3xl font-bold mb-6'>📅 크롤링 데이터 요청</h1>
      <div className='flex space-x-4 mb-8'>
        <input
          type='month'
          value={day}
          onChange={(e) => setDay(e.target.value)}
          className='p-2 border border-gray-300 rounded'
        />
        <button
          onClick={handleFetch}
          disabled={loading}
          className='bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400'
        >
          {loading ? '데이터 처리 중...' : '데이터 요청 (API 호출)'}
        </button>
      </div>

      {error && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
          오류: {error}
        </div>
      )}

      {data && (
        <div className='bg-green-50 p-6 rounded-lg shadow-md'>
          <h2 className='text-2xl font-semibold mb-3'>✅ 요청 결과</h2>
          <p className='text-lg'>
            날짜: <span className='font-mono text-blue-800'>{data.day}</span>
          </p>
          <p className='text-lg'>
            총 요청 수:{' '}
            <span className='font-bold text-xl text-green-700'>
              {data.requests.toLocaleString()}
            </span>{' '}
            회
          </p>
        </div>
      )}

      <hr className='my-8' />
    </div>
  );
}
