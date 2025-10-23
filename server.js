const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// 환경 변수 로드
dotenv.config();

const User = require('./models/users');

const app = express();

// JSON 요청 본문 파싱
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 제공 - 프로젝트 루트 디렉토리에서 정적 파일 제공
app.use(express.static(path.resolve(__dirname)));

// MySQL 연결 풀 생성
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'work_management',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const userRouter = require('./routes/user')(pool);
app.use('/api/user', userRouter);

// 데이터베이스 연결 테스트
async function testDatabaseConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('데이터베이스 연결 성공!');
    connection.release();
    return true;
  } catch (error) {
    console.error('데이터베이스 연결 오류:', error);
    return false;
  }
}

const userModel = new User(pool);

// JWT 인증 미들웨어
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: '인증 토큰이 필요합니다.' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: '유효하지 않은 토큰입니다.' });
    }
    req.user = user;
    next();
  });
}

// API 라우트 - 로그인
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('로그인 시도:', { username });
    
    // 데이터베이스 연결 확인
    const isConnected = await testDatabaseConnection();
    if (!isConnected) {
      console.log('데이터베이스 연결 실패, 임시 로그인 처리');
      
      // 개발 환경에서만 임시 로그인 허용 (실제 운영에서는 제거)
      if (process.env.NODE_ENV === 'development' && username === 'admin') {
        return res.json({
          token: 'dev-token-' + Date.now(),
          user: {
            id: 1,
            username: 'admin',
            name: '관리자',
            role: 'admin'
          }
        });
      }
      
      return res.status(500).json({ message: '데이터베이스 연결에 실패했습니다.' });
    }
    
    // 데이터베이스에서 사용자 조회
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    
    if (rows.length === 0) {
      return res.status(401).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' });
    }
    
    const user = rows[0];
    
    // 비밀번호 확인
    let isPasswordValid = false;
    
    try {
      // bcrypt로 해시된 비밀번호 비교 시도
      isPasswordValid = await bcrypt.compare(password, user.password);
    } catch (error) {
      console.warn('bcrypt 비교 오류, 일반 비교 시도:', error.message);
      // bcrypt가 아닌 경우 일반 비교
      isPasswordValid = (password === user.password);
    }
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' });
    }
    
    // JWT 토큰 생성
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );
    
    // 사용자 정보에서 비밀번호 제거
    delete user.password;
    
    // 마지막 로그인 시간 업데이트
    try {
      await pool.execute(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP() WHERE id = ?',
        [user.id]
      );
    } catch (error) {
      console.warn('마지막 로그인 시간 업데이트 실패:', error.message);
    }
    
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        email: user.email,
        department: user.department
      }
    });
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// API 라우트 - 사용자 정보 조회
app.get('/api/user', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, username, name, role, email, department FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// API 라우트 - 회원가입
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, name } = req.body;
    
    // 아이디 중복 확인
    const existingUser = await userModel.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: '이미 사용 중인 아이디입니다.' });
    }
    
    // 유효성 검사
    const usernameRegex = /^[a-zA-Z0-9]{4,20}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ message: '아이디는 영문, 숫자 조합 4-20자로 입력해주세요.' });
    }
    
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ message: '비밀번호는 영문, 숫자, 특수문자 조합 8자 이상으로 입력해주세요.' });
    }
    
    // 사용자 생성
    const userId = await userModel.create({
      username,
      password,
      name,
      role: 'user' // 기본 역할은 user
    });
    
    res.status(201).json({
      message: '회원가입이 완료되었습니다.',
      userId
    });
  } catch (error) {
    console.error('회원가입 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 명시적인 라우트 정의
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'index.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'index.html'));
});

// HTML 파일들에 대한 라우팅
app.get('/html/:page', (req, res) => {
  const page = req.params.page;
  res.sendFile(path.resolve(__dirname, 'html', page));
});

// 명시적인 로그인 페이지 라우팅
app.get('/login.html', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'html/login.html'));
});

app.get('/html/login.html', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'html/login.html'));
});

// 404 처리
app.use((req, res) => {
  console.log('404 에러 발생:', req.path);
  res.status(404).send('페이지를 찾을 수 없습니다.');
});

// 서버 시작
const PORT = process.env.PORT || 6005;
app.listen(PORT, async () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  await testDatabaseConnection();
});