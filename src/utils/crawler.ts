import axios from 'axios';
import * as cheerio from 'cheerio';

export interface RequestData {
  day: string;
  requests: number;
}

export async function fetchRequests(day: string): Promise<RequestData> {
  const url = `https://pfa.wxd.vaisala.com/stat.php?h=gUCUN8klV1IFTvce&day=${day}`;
  
  try {
    const { data } = await axios.get(url);

    const $ = cheerio.load(typeof data === 'string' ? data : '');
    const requestsText = $('table')
      .first()
      .find('tr')
      .eq(1)
      .find('td')
      .eq(2)
      .text()
      .trim();

    const requests = Number(requestsText);

    if (isNaN(requests)) {
      console.warn(`[Crawler] 파싱 실패: "${requestsText}"`);
      return { day, requests: 0 }; 
    }
    
    return { day, requests };
  } catch (error) {
    console.error(`[Crawler] 데이터 가져오기 실패 (Day: ${day}):`, error);
    throw new Error('외부 소스에서 데이터를 가져오지 못했습니다.');
  }
}