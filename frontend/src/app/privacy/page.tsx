export const metadata = {
  title: "개인정보처리방침 - 유기 동물 공고",
};

export default function PrivacyPage() {
  return (
    <main style={{ fontFamily: "sans-serif", maxWidth: 720, margin: "0 auto", padding: "40px 24px", color: "#1c1917", lineHeight: 1.8 }}>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 8 }}>개인정보처리방침</h1>
      <p style={{ fontSize: "0.85rem", color: "#78716c", marginBottom: 32 }}>시행일: 2026년 3월 29일</p>

      <p style={{ fontSize: "0.95rem", color: "#44403c" }}>
        유기 동물 공고(이하 &quot;앱&quot;)는 농림축산식품부 동물보호관리시스템에서 제공하는
        유기 동물 공고 데이터를 조회하는 서비스입니다.
      </p>

      <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: 32, marginBottom: 8 }}>1. 수집하는 개인정보</h2>
      <p style={{ fontSize: "0.95rem", color: "#44403c" }}>본 앱은 사용자의 개인정보를 수집하지 않습니다. 회원가입, 로그인, 결제 기능이 없으며 별도의 계정이 필요하지 않습니다.</p>

      <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: 32, marginBottom: 8 }}>2. 개인정보의 이용 목적</h2>
      <p style={{ fontSize: "0.95rem", color: "#44403c" }}>개인정보를 수집하지 않으므로 이용 목적이 없습니다.</p>

      <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: 32, marginBottom: 8 }}>3. 개인정보의 보유 및 파기</h2>
      <p style={{ fontSize: "0.95rem", color: "#44403c" }}>개인정보를 수집하지 않으므로 보유 및 파기 대상이 없습니다.</p>

      <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: 32, marginBottom: 8 }}>4. 제3자 제공</h2>
      <p style={{ fontSize: "0.95rem", color: "#44403c" }}>개인정보를 수집하지 않으므로 제3자 제공이 없습니다. 다만 앱은 다음 외부 서비스를 사용합니다.</p>
      <ul style={{ fontSize: "0.95rem", color: "#44403c" }}>
        <li>농림축산식품부 동물보호관리시스템 API (유기 동물 공고 데이터 조회)</li>
        <li>카카오 공유 SDK (공유 기능, 선택 사용)</li>
      </ul>

      <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: 32, marginBottom: 8 }}>5. 서버 접속 로그</h2>
      <p style={{ fontSize: "0.95rem", color: "#44403c" }}>
        앱은 유기 동물 데이터를 제공하는 백엔드 서버(Render 호스팅)를 통해 데이터를 조회합니다.
        서버는 서비스 운영 및 오류 대응을 위해 접속 시각, IP 주소, 요청 경로 등 표준 접속 로그를 일시적으로 보관할 수 있습니다.
        이 로그는 서비스 운영 목적 외에 사용되지 않으며, Render의 정책에 따라 일정 기간 보관 후 자동 삭제됩니다.
      </p>

      <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: 32, marginBottom: 8 }}>6. 인터넷 권한</h2>
      <p style={{ fontSize: "0.95rem", color: "#44403c" }}>앱은 유기 동물 공고 데이터를 불러오기 위해 인터넷 접속 권한을 사용합니다. 그 외 카메라, 위치, 연락처 등의 권한은 요청하지 않습니다.</p>

      <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: 32, marginBottom: 8 }}>7. 문의</h2>
      <p style={{ fontSize: "0.95rem", color: "#44403c" }}>개인정보처리방침에 관한 문의사항이 있으시면 아래로 연락해 주세요.</p>
      <ul style={{ fontSize: "0.95rem", color: "#44403c" }}>
        <li>이메일: <a href="mailto:hassy2302@gmail.com" style={{ color: "#C2410C" }}>hassy2302@gmail.com</a></li>
      </ul>
    </main>
  );
}
