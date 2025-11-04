// app/api/requests/route.ts
import { NextResponse } from 'next/server';
import { fetchRequests, RequestData } from '@/utils/crawler';
import { getMonthsInRange } from '@/utils/date';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startMonth = searchParams.get('start');
  const endMonth = searchParams.get('end');

  if (!startMonth || !endMonth) {
    return NextResponse.json(
      { error: 'start와 end 쿼리 파라미터(YYYY-MM 형식)가 모두 필요합니다.' },
      { status: 400 }
    );
  }

  try {
    const monthsToFetch = getMonthsInRange(startMonth, endMonth);

    const promises: Promise<RequestData>[] = monthsToFetch.map((month) => {
      const dayString = `${month}`;
      return fetchRequests(dayString);
    });

    const results = await Promise.all(promises);

    return NextResponse.json(results);
  } catch (error) {
    console.error(`[Monthly Range API] 데이터 처리 중 오류 발생:`, error);
    return NextResponse.json(
      { error: '기간별 데이터를 가져오는 중 서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
