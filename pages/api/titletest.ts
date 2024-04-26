// test.ts

import { fetchTitles } from './title';



async function testFetchTitles() {
  const urls = [
    'https://www.pingwest.com/w/294309',
    'https://en.pingwest.com/about',
    'https://www.example.com',
  ];
  const titles = await fetchTitles(urls);
  console.log('Titles:', titles);
}


testFetchTitles();