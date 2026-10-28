// 학생망 접속 시험용 (구글 Apps Script 웹 앱)
// 이 파일 내용 전체를 Apps Script 편집기의 Code.gs에 붙여 넣으세요.

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('접속 시험')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// 화면에서 구글 서버로 질문을 보내면 지금 시각을 돌려준다 (실시간 연결이 되는지 확인용)
function ping() {
  return new Date().toLocaleTimeString('ko-KR');
}
