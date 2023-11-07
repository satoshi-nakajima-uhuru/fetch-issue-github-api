const fs = require('fs').promises;
require('dotenv').config();

async function fetchIssuesForGitHubAPI() {
  try {
    const TOKEN = process.env.TOKEN;
    const OWNER = process.env.OWNER;
    const REPO = process.env.REPO;
    const MILESTONE_NUMBER = process.env.MILESTONE_NUMBER;
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/issues?milestone=${MILESTONE_NUMBER}&state=all&per_page=100`;
    const options = {
      method: 'GET',
      headers: {
        'Authorization': `token ${TOKEN}`
      }
    };

    const response = await fetch(url, options);
    if (response.ok) {
      const data = await response.json();
      const jsonData = JSON.stringify(data, null, 2);
      await fs.writeFile('issues.json', jsonData, 'utf-8');
      console.log('✅ issues.json へ書き込み成功しました');
    } else {
      throw new Error('🟥 issue 取得に失敗しました');
    }
  } catch (error) {
    console.error(error);
  }
}

async function filterTitleAndIssue() {
  try {
    const rawData = await fs.readFile('issues.json', 'utf-8');
    const issues = JSON.parse(rawData);
    const newData = issues.map(issue => ({
      title: issue.title,
      issue: issue.number
      // created_at: issue.created_at,
    }));
    const outputData = JSON.stringify(newData, null, 2);
    await fs.writeFile('output.json', outputData, 'utf-8');
    console.log('✅ output.json へ書き込み成功しました');
    return newData;
  } catch (error) {
    console.error('🟥 output.json へ書き込みが失敗しました：', error);
  }
}

async function convertJsonToCsv(jsonData) {
  const csvHeader = 'title;issue';
  const csvData = jsonData.map(item => `${item.title.replace(/"/g, '""')};${item.issue}`).join('\n');
  const csv = `${csvHeader}\n${csvData}`;
  try {
    await fs.writeFile('output.csv', csv, 'utf-8');
    console.log('✅ output.csv へ書き込み成功しました');
  } catch (error) {
    console.error('🟥 output.csv へ書き込みが失敗しました：', error);
  }
}

async function main() {
  await fetchIssuesForGitHubAPI();
  const res = await filterTitleAndIssue();
  await convertJsonToCsv(res);
}

main();
