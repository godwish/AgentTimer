# AgentTimer

AgentTimer is a lightweight, localized web application designed for tracking and managing personal agent usage limits and cooldowns. It focuses on providing a clean UI for solitary managers with seamless language switching and secure administrative access.

## Features

- **Agent Management**: Register and manage multiple agents seamlessly.
- **Cooldown Tracking**: Set customizable cooldown timers and visually track progress via intuitive percentage bars.
- **Localization (i18n)**: Instantly switch between Korean, English, and Japanese from the settings menu.
- **Admin Configuration**: First-run setup guarantees privacy by creating an exclusive admin account instantly connected securely to the database.
- **Simple Infrastructure**: Fully containerized and powered by a highly portable SQLite database.

## Installation and Quick Start

You can run AgentTimer using either the pre-built image from Docker Hub or by building it locally from the source.

### Option 1: Using Docker Hub (Recommended)
This is the fastest method. You only need a `docker-compose.yml` file.

1. Create a `docker-compose.yml` file:
   ```yaml
   services:
     agent-timer:
       image: koseungmin/agent-timer:latest
       container_name: agent-timer
       restart: unless-stopped
       ports:
         - "3000:3000"
       volumes:
         - ./data:/app/data
   ```
2. Run the container:
   ```bash
   docker-compose up -d
   ```

### Option 2: Building Locally (For Developers)
Use this method if you want to modify the source code.

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/agent-timer.git
   cd agent-timer
   ```
2. Build and run:
   ```bash
   docker-compose up -d --build
   ```

## Docker Compose Configuration

The following parameters in `docker-compose.yml` define how the application runs:

| Parameter | Description |
| :--- | :--- |
| `image` / `build` | Defines whether to pull the pre-built image (`koseungmin/agent-timer`) or build it from the local `Dockerfile`. |
| `ports` | Maps the host port to the container port. Example `"3000:3000"` means you access the app at `http://localhost:3000`. |
| `volumes` | **Critical for Data Persistence.** Maps `./data` on your host to `/app/data` in the container. This ensures your SQLite database file (`timer.sqlite`) survives container updates or restarts. |
| `environment` | `NODE_ENV`: Sets the app mode (production/development).<br>`DB_PATH`: Points the app to the database file within the volume. |
| `logging` | Limits the size of log files on your system. `max-size: "10m"` prevents the logs from consuming too much disk space. |

> [!IMPORTANT]
> **Data Persistence**: Always ensure the `volumes` section is present. Your usage data and admin account are stored in `./data/timer.sqlite` on the host machine.

## Local Development (Without Docker)

You can run the frontend and backend separately for specific development purposes:

1. **Backend**:
   ```bash
   cd server
   npm install
   npm run dev
   ```
2. **Frontend**:
   ```bash
   cd client
   npm install
   npm run dev
   ```

## License

This project is open-source and licensed under the [MIT License](LICENSE).

---

# AgentTimer (한국어)

AgentTimer는 개인 에이전트 사용 제한 및 쿨타임을 추적하고 관리하기 위해 설계된 가볍고 현지화된 웹 애플리케이션입니다. 원활한 언어 전환과 보안 상태의 관리자 접근 기능을 갖춘 깔끔한 UI를 제공하는 데 집중했습니다.

## 주요 기능

- **에이전트 관리**: 여러 에이전트를 원활하게 등록하고 관리할 수 있습니다.
- **쿨타임 추적**: 사용자가 설정 가능한 쿨타임 타이머를 제공하며, 직관적인 퍼센트 바를 통해 진행 상황을 시각적으로 추적합니다.
- **다국어 지원 (i18n)**: 설정 메뉴에서 한국어, 영어, 일본어 간 즉시 전환이 가능합니다.
- **관리자 설정**: 첫 실행 시 관리자 계정을 즉석에서 생성하여 데이터베이스에 안전하게 연결함으로써 프라이버시를 보장합니다.
- **간결한 인프라**: SQLite 데이터베이스를 기반으로 하며 전체 컨테이너화되어 있습니다.

## 설치 및 빠른 시작

Docker Hub의 빌드된 이미지를 사용하거나 소스에서 직접 빌드하여 실행할 수 있습니다.

### 옵션 1: Docker Hub 사용 (권장)
가장 빠른 방법입니다. `docker-compose.yml` 파일 하나만 있으면 됩니다.

1. `docker-compose.yml` 파일을 생성합니다:
   ```yaml
   services:
     agent-timer:
       image: koseungmin/agent-timer:latest
       container_name: agent-timer
       restart: unless-stopped
       ports:
         - "3000:3000"
       volumes:
         - ./data:/app/data
   ```
2. 컨테이너를 실행합니다:
   ```bash
   docker-compose up -d
   ```

### 옵션 2: 로컬에서 빌드 및 실행 (개발자용)
소스 코드를 수정하려는 경우 이 방법을 사용하세요.

1. 저장소를 클론합니다:
   ```bash
   git clone https://github.com/your-username/agent-timer.git
   cd agent-timer
   ```
2. 빌드 및 실행합니다:
   ```bash
   docker-compose up -d --build
   ```

## Docker Compose 설정 상세

`docker-compose.yml`의 다음 파라미터들은 애플리케이션의 작동 방식을 정의합니다:

| 파라미터 | 설명 |
| :--- | :--- |
| `image` / `build` | 빌드된 이미지(`koseungmin/agent-timer`)를 가져올지, 로컬 `Dockerfile`을 통해 직접 빌드할지 결정합니다. |
| `ports` | 호스트 포트와 컨테이너 포트를 매핑합니다. 예: `"3000:3000"`은 `http://localhost:3000`으로 접속함을 의미합니다. |
| `volumes` | **데이터 영속성에 필수적입니다.** 호스트의 `./data`를 컨테이너의 `/app/data`에 매핑합니다. 이를 통해 컨테이너 교체나 업데이트 시에도 SQLite DB(`timer.sqlite`)가 보존됩니다. |
| `environment` | `NODE_ENV`: 앱 실행 모드(production/development)를 설정합니다.<br>`DB_PATH`: 볼륨 내부의 DB 파일 경로를 지정합니다. |
| `logging` | 시스템의 로그 파일 크기를 제한합니다. `max-size: "10m"`은 로그가 디스크 공간을 과도하게 점유하는 것을 방지합니다. |

> [!IMPORTANT]
> **데이터 영속성**: 반드시 `volumes` 섹션을 포함하세요. 사용 데이터와 관리자 계정 정보는 호스트의 `./data/timer.sqlite` 폴더에 저장됩니다.

## 로컬 개발 (도커 없이 실행)

개발 목적으로 프론트엔드와 백엔드를 따로 실행할 수 있습니다:

1. **백엔드 (Backend)**:
   ```bash
   cd server
   npm install
   npm run dev
   ```
2. **프론트엔드 (Frontend)**:
   ```bash
   cd client
   npm install
   npm run dev
   ```

## 라이선스

이 프로젝트는 오픈 소스이며 [MIT License](LICENSE)에 따라 배포됩니다.
