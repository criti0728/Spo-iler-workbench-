[구글독스](https://docs.google.com/document/d/1SGMtZOGRSk42DyslsK9BDZlZRZfsByDZmD9C12JSYds/edit?usp=sharing)
[피그마](https://www.figma.com/design/73VSLdfkhjtWZpaeU1hbZm/%EC%8A%B9%EB%B6%80%EC%98%88%EC%B8%A1?node-id=0-1&t=4Yoyy4iRh3Dn3wLv-1)
[노션](https://www.notion.so/PJT-B-11b943c01a2e80f6ade6db84130922d3)
![komi](https://github.com/user-attachments/assets/4b2c4cd1-8995-46fd-b4ed-bd92b16cf3bd)
# **Spo-iler 프로젝트 보고서**

## **1. 기획 배경 및 목적**
### **기획 배경**
스포츠 경기는 관객들에게 흥미진진한 경험을 선사하지만, 경기 규칙을 잘 모르는 사람들에게는 이해하기 어렵고 흥미를 잃게 만드는 경우가 많습니다. 이러한 문제를 해결하고, 누구나 스포츠 이벤트를 즐길 수 있도록 돕기 위해 **"Spo-iler"** 프로젝트가 시작되었습니다.

### **목적**
"**Spo-iler**"는 선수와 감독의 표정을 분석하여 경기의 흐름을 예측하고, 사용자에게 직관적으로 승률과 판도를 제공함으로써 스포츠 이벤트에 대한 이해를 돕는 웹 서비스입니다. 이를 통해 스포츠 초보자도 경기에 자연스럽게 참여할 수 있는 기회를 제공합니다.

---

## **2. 프레임워크 및 툴의 선정 이유**

### **프론트엔드**
- **Vue.js**: 
  - 경량화된 SPA(Single Page Application) 개발에 적합.
  - 컴포넌트 기반 구조로 코드 재사용성과 유지보수성을 극대화.
- **Vue Router**: 
  - 클라이언트 사이드에서 빠르고 매끄러운 라우팅 제공.
- **Vuex**: 
  - 중앙 상태 관리로 컴포넌트 간 데이터 동기화를 간소화.
- **Axios**: 
  - 효율적인 HTTP 요청 처리를 위해 사용.

### **백엔드**
- **Spring Boot**: 
  - 신속한 설정과 개발을 지원하며, RESTful API 구현에 적합.
- **Spring Security**: 
  - 인증 및 권한 관리의 표준 솔루션으로, 안전한 서비스 제공.
- **Hibernate (JPA)**: 
  - 데이터베이스와의 원활한 연동 및 NoSQL 데이터 처리 지원.
- **JWT (JSON Web Token)**: 
  - 세션리스 인증을 통해 확장성과 서버 부하를 줄임.

### **AI 및 데이터 분석**
- **TensorFlow.js**: 
  - 브라우저 기반 실시간 얼굴 탐지 및 감정 분석 가능.
  - MobileNet 기반 경량 모델로, 다양한 환경에서 최적화된 성능 제공.
- **AI Hub 데이터**: 
  - 한국인 감정을 학습한 데이터로 정확성을 높임.

---

## **3. 기대 효과**

### **사용자 관점**
- **스포츠 초보자 친화적**: 
  - 경기 규칙을 잘 모르는 사용자도 승률 예측을 통해 경기를 즐길 수 있음.
- **직관적 이해 제공**: 
  - 표정을 기반으로 한 분석 결과는 복잡한 데이터 대신 간단한 시각적 정보를 제공.
- **참여도 향상**: 
  - 스포츠 이벤트 참여의 장벽을 낮춰, 새로운 팬층 유입 기대.

### **비즈니스 관점**
- **스포츠 플랫폼 확장 가능성**: 
  - 기존 스포츠 중계 서비스와 결합하여 추가 수익 창출 가능.
- **데이터 기반 서비스 강화**: 
  - 표정 분석과 경기 데이터를 활용해 더 많은 기능(예: 선수 성향 분석, 팀 전략 추천) 추가 가능.
- **글로벌 진출 잠재력**: 
  - 다양한 스포츠와 문화를 반영해 글로벌 사용자층을 확보할 수 있음.

---


![웹페이지 구성](./mock-up/web_ver1.PNG)
