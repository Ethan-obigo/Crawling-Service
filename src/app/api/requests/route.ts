// app/api/requests/route.ts
import { NextResponse } from 'next/server';
import { fetchRequests } from '@/utils/crawler';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const day = searchParams.get('day');

  if (!day) {
    return NextResponse.json(
      { error: 'day 쿼리 파라미터가 누락되었습니다.' }, 
      { status: 400 }
    );
  }

  try {
    const data = await fetchRequests(day);
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: `데이터를 가져오는 중 서버 오류가 발생했습니다.\n${error}` }, 
      { status: 500 }
    );
  }
}