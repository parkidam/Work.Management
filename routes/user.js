/**
 * 사용자 관리 API 라우트
 */

const express = require('express');
const router = express.Router();
const User = require('../models/users');
// 사용자 모델 인스턴스 생성
let userModel;

// 라우터 초기화 함수
function initRouter(pool) {
  userModel = new User(pool);
  return router;
}

/**
 * 모든 사용자 목록 조회
 */
router.get('/', async (req, res) => {
  try {
    const users = await userModel.findAll();
    res.json(users);
  } catch (error) {
    console.error('사용자 목록 조회 오류:', error);
    res.status(500).json({ message: '사용자 목록을 조회하는 중 오류가 발생했습니다.' });
  }
});

/**
 * 사용자 검색
 */
router.get('/search', async (req, res) => {
  try {
    const { name, department, role, status } = req.query;
    const criteria = {};
        
    if (name) criteria.name = name;
    if (department) criteria.department = department;
    if (role) criteria.role = role;
    if (status) criteria.status = status;
        
    const users = await userModel.search(criteria);
    res.json(users);
  } catch (error) {
    console.error('사용자 검색 오류:', error);
    res.status(500).json({ message: '사용자 검색 중 오류가 발생했습니다.' });
  }
});

/**
 * 특정 사용자 조회
 */
router.get('/:id', async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    res.json(user);
  } catch (error) {
    console.error('사용자 조회 오류:', error);
    res.status(500).json({ message: '사용자를 조회하는 중 오류가 발생했습니다.' });
  }
});

/**
 * 새 사용자 추가
 */
router.post('/', async (req, res) => {
  try {
    const { name, username, email, phone, department, position, role, status, password, sendWelcomeEmail } = req.body;
    
    // 필수 필드 검증
    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: '모든 필수 필드를 입력해주세요.' });
    }
    // 사용자명 중복 확인
    const existingUser = await userModel.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: '이미 사용 중인 사용자명입니다.' });
    }
        
    // 새 사용자 생성
    const userData = {
      name,
      username,
      email,
      phone,
      department,
      position,
      role: role || 'user',
      status: status || 'active',
      password
    };
    
    const userId = await userModel.create(userData);
    
    // 환영 이메일 발송 (필요시)
    if (sendWelcomeEmail) {
      // 이메일 발송 로직 구현
      console.log(`환영 이메일 발송: ${email}`);
    }
    
    res.status(201).json({
      message: '사용자가 성공적으로 추가되었습니다.',
      userId
    });
  } catch (error) {
    console.error('사용자 추가 오류:', error);
    res.status(500).json({ message: '사용자 추가 중 오류가 발생했습니다.' });
  }
});

/**
 * 사용자 정보 수정
 */
router.put('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, phone, department, position, role, status, sendUpdateEmail } = req.body;
    
    // 필수 필드 검증
    if (!name || !email) {
      return res.status(400).json({ message: '이름과 이메일은 필수 입력 항목입니다.' });
    }
        
    // 사용자 존재 확인
    const existingUser = await userModel.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    
    // 사용자 정보 업데이트
    const userData = {
      name,
      email,
      phone,
      department,
      position,
      role,
      status
    };
    
    const success = await userModel.update(userId, userData);
    
    if (!success) {
      return res.status(500).json({ message: '사용자 정보 업데이트에 실패했습니다.' });
    }
    
    // 정보 변경 알림 이메일 발송 (필요시)
    if (sendUpdateEmail) {
      // 이메일 발송 로직 구현
      console.log(`정보 변경 알림 이메일 발송: ${email}`);
    }
    
    res.json({
      message: '사용자 정보가 성공적으로 수정되었습니다.'
    });
  } catch (error) {
    console.error('사용자 수정 오류:', error);
    res.status(500).json({ message: '사용자 수정 중 오류가 발생했습니다.' });
  }
});

/**
 * 비밀번호 초기화
 */
router.post('/:id/reset-password', async (req, res) => {
  try {
    const userId = req.params.id;
    const { newPassword, sendEmail } = req.body;
    
    if (!newPassword) {
      return res.status(400).json({ message: '새 비밀번호를 입력해주세요.' });
    }
    
    // 사용자 존재 확인
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    
    // 비밀번호 변경
    const success = await userModel.changePassword(userId, newPassword);
    
    if (!success) {
      return res.status(500).json({ message: '비밀번호 초기화에 실패했습니다.' });
    }
    
    // 비밀번호 초기화 알림 이메일 발송 (필요시)
    if (sendEmail) {
      // 이메일 발송 로직 구현
      console.log(`비밀번호 초기화 알림 이메일 발송: ${user.email}`);
    }
    
    res.json({ message: '비밀번호가 성공적으로 초기화되었습니다.' });
  } catch (error) {
    console.error('비밀번호 초기화 오류:', error);
    res.status(500).json({ message: '비밀번호 초기화 중 오류가 발생했습니다.' });
  }
});

/**
 * 사용자 삭제
 */
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    // 사용자 존재 확인
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    
    // 사용자 삭제
    const success = await userModel.delete(userId);
    
    if (!success) {
      return res.status(500).json({ message: '사용자 삭제에 실패했습니다.' });
    }
    
    res.json({ message: '사용자가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('사용자 삭제 오류:', error);
    res.status(500).json({ message: '사용자 삭제 중 오류가 발생했습니다.' });
  }
});

/**
 * 일괄 활성화
 */
router.post('/bulk-activate', async (req, res) => {
  try {
    const { userIds } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: '활성화할 사용자 ID를 선택해주세요.' });
    }
    
    // 일괄 활성화
    const affectedRows = await userModel.bulkUpdateStatus(userIds, 'active');
    
    res.json({ 
      message: `${affectedRows}명의 사용자가 활성화되었습니다.`,
      affectedRows
    });
  } catch (error) {
    console.error('일괄 활성화 오류:', error);
    res.status(500).json({ message: '사용자 활성화 중 오류가 발생했습니다.' });
  }
});

/**
 * 일괄 비활성화
 */
router.post('/bulk-deactivate', async (req, res) => {
  try {
    const { userIds } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: '비활성화할 사용자 ID를 선택해주세요.' });
    }
    
    // 일괄 비활성화
    const affectedRows = await userModel.bulkUpdateStatus(userIds, 'inactive');
    
    res.json({ 
      message: `${affectedRows}명의 사용자가 비활성화되었습니다.`,
      affectedRows
    });
  } catch (error) {
    console.error('일괄 비활성화 오류:', error);
    res.status(500).json({ message: '사용자 비활성화 중 오류가 발생했습니다.' });
  }
});
module.exports = initRouter;
