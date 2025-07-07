# Tokamak ZK-EVM Airdrop Event Page

Next.js로 제작된 Tokamak Network ZK-EVM 에어드랍 이벤트 페이지입니다.

## 🚀 주요 기능

- **피그마 디자인 토큰 자동 동기화**: 디자이너의 피그마 파일에서 자동으로 색상, 폰트, 간격 등을 추출
- **현대적인 UI/UX**: Tailwind CSS와 피그마 디자인 시스템을 활용한 세련된 디자인
- **반응형 디자인**: 모바일부터 데스크톱까지 모든 디바이스에서 최적화된 경험
- **에어드랍 참여 기능**: 지갑 연결, 자격 확인, 토큰 신청 등 완전한 에어드랍 플로우
- **다크모드 지원**: 사용자 선호도에 따른 테마 전환
- **TypeScript**: 타입 안정성과 개발자 경험 향상

## 🎨 디자인 시스템

### 피그마 통합

- **파일**: [Figma Design File](https://www.figma.com/design/0R11fVZOkNSTJjhTKvUjc7/Ooo)
- **자동 토큰 추출**: 색상, 타이포그래피, 간격 등 자동 동기화
- **실시간 업데이트**: 피그마 파일 변경 시 자동 반영

### 색상 팔레트

- **Primary**: Tokamak 브랜드 색상 (`tokamak-*`)
- **Secondary**: 에어드랍 이벤트 색상 (`airdrop-*`)
- **Grayscale**: 그레이스케일 시스템 (`grayscale-*`)
- **Applied**: 적용된 표면 색상 (`applied-*`)

## 📦 기술 스택

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Design System**: Figma API 통합
- **State Management**: React Hooks
- **Development**: ESLint, Prettier

## 🛠️ 설치 및 실행

### 1. 클론 및 의존성 설치

```bash
git clone <repository-url>
cd tokamak-zk-evm-airdrop
npm install
```

### 2. 피그마 디자인 토큰 설정

```bash
# 피그마 API 토큰과 파일 키 설정
node setup-figma-quick.js

# 또는 수동으로 .env.local 파일 생성
echo "FIGMA_TOKEN=your-figma-token" >> .env.local
echo "FIGMA_FILE_KEY=0R11fVZOkNSTJjhTKvUjc7" >> .env.local
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`을 열어 확인하세요.

## 📱 페이지 구성

### 메인 페이지

- **Header**: 네비게이션 및 지갑 연결
- **Hero Section**: 메인 배너 및 CTA
- **Stats Section**: 에어드랍 통계
- **Airdrop Section**: 에어드랍 참여 카드들
- **How It Works**: 참여 방법 가이드
- **FAQ Section**: 자주 묻는 질문
- **Footer**: 링크 및 소셜 미디어

### 컴포넌트

- `Header.tsx`: 상단 네비게이션
- `Hero.tsx`: 메인 히어로 섹션
- `Stats.tsx`: 통계 표시
- `AirdropSection.tsx`: 에어드랍 카드 리스트
- `HowItWorks.tsx`: 참여 방법 가이드
- `FAQ.tsx`: 확장 가능한 FAQ
- `Footer.tsx`: 하단 정보

## 🎯 에어드랍 기능

### 참여 플로우

1. **지갑 연결**: MetaMask 등 지원 지갑 연결
2. **자격 확인**: 참여 조건 자동 검증
3. **토큰 신청**: 원하는 에어드랍 선택
4. **승인 대기**: 검토 과정 진행
5. **토큰 수령**: 지갑으로 토큰 전송

### 에어드랍 유형

- **얼리 어답터 보너스**: 초기 사용자 대상 (1,000 TON)
- **개발자 인센티브**: DApp 개발자 대상 (2,500 TON)
- **커뮤니티 참여**: 커뮤니티 활동 보상 (500 TON)

## 🔧 개발 스크립트

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 린팅
npm run lint

# 피그마 디자인 토큰 동기화
npm run figma:sync

# 피그마 자동 감시 모드
npm run figma:watch
```

## 🎨 Figma 통합

### 설정 방법

1. [Figma API 토큰 생성](https://www.figma.com/developers/api#access-tokens)
2. `node setup-figma-quick.js` 실행
3. 토큰 입력하여 자동 설정 완료

### 사용 방법

```bash
# 수동 동기화
npm run figma:sync

# 자동 감시 모드 (실시간 동기화)
npm run figma:watch
```

### 파일 구조

```
design-system/
├── tokens/
│   └── tokens.json          # 피그마에서 추출한 디자인 토큰
├── components/
│   └── ...                  # 컴포넌트 정의
figma-exports/
├── ...                      # 피그마 에셋 내보내기
```

## 🌐 배포

### Vercel 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel --prod
```

### 환경 변수 설정

- `FIGMA_TOKEN`: 피그마 API 토큰
- `FIGMA_FILE_KEY`: 피그마 파일 키

## 📖 코딩 가이드라인

### 스타일 규칙

- **코드 주석**: 영어로 작성
- **변수/함수명**: camelCase (영어)
- **컴포넌트명**: PascalCase
- **파일명**: kebab-case

### Tailwind CSS 규칙

- Utility-first 접근법 사용
- 피그마 디자인 토큰 우선 활용
- 반응형 디자인 (mobile-first)
- 다크모드 지원

### TypeScript 규칙

- Strict mode 사용
- 모든 props에 타입 정의
- Interface > Type 선호

## 🤝 기여 방법

1. 이슈 생성 또는 기존 이슈 확인
2. 피처 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'Add amazing feature'`)
4. 브랜치 푸시 (`git push origin feature/amazing-feature`)
5. Pull Request 생성

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🔗 링크

- [Tokamak Network](https://tokamak.network)
- [Figma Design File](https://www.figma.com/design/0R11fVZOkNSTJjhTKvUjc7/Ooo)
- [Live Demo](https://tokamak-zk-evm-airdrop.vercel.app)

---

**Built with ❤️ by Tokamak Network Team**
