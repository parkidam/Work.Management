const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

class User {
  constructor(pool) {
    this.pool = pool;
  }
  // 검색 조건에 맞는 사용자 조회
  async search(criteria) {
    try {
      let query = `
        SELECT u.id, u.username, u.name, u.email, u.phone, u.role, u.status, 
               u.created_at, u.updated_at, u.last_login_at, 
               d.name as department_name
        FROM users u
        LEFT JOIN departments d ON u.department_id = d.id
        WHERE 1=1
      `;
      const params = [];
      
      if (criteria.name) {
        query += ` AND u.name LIKE ?`;
        params.push(`%${criteria.name}%`);
      }
      
      if (criteria.department) {
        query += ` AND u.department_id = ?`;
        params.push(criteria.department);
      }
      
      if (criteria.role) {
        query += ` AND u.role = ?`;
        params.push(criteria.role);
      }
      
      if (criteria.status) {
        query += ` AND u.status = ?`;
        params.push(criteria.status);
      }
      
      query += ` ORDER BY u.id DESC`;
      
      const [rows] = await this.pool.execute(query, params);
      return rows;
    } catch (error) {
      console.error('사용자 검색 오류:', error);
      throw error;
    }
  }

  // 여러 사용자의 상태 일괄 변경
  async bulkUpdateStatus(ids, status) {
    try {
      // MySQL에서는 IN 절에 배열을 직접 사용할 수 없으므로 
      // 쿼리 파라미터를 동적으로 생성
      const placeholders = ids.map(() => '?').join(',');
      const query = `
        UPDATE users
        SET status = ?,
            updated_at = NOW()
        WHERE id IN (${placeholders})
      `;
      
      const params = [status, ...ids];
      const [result] = await this.pool.execute(query, params);
      
      return result.affectedRows;
    } catch (error) {
      console.error('사용자 상태 일괄 변경 오류:', error);
      throw error;
    }
  }
  // 사용자 이름으로 사용자 찾기
  async findByUsername(username) {
    try {
      const [rows] = await this.pool.execute(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('사용자 조회 오류:', error);
      throw error;
    }
  }

  // ID로 사용자 찾기
  async findById(id) {
    try {
      const [rows] = await this.pool.execute(
        'SELECT id, username, name, role FROM users WHERE id = ?',
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('사용자 조회 오류:', error);
      throw error;
    }
  }

  // 새 사용자 생성
  async create(userData) {
    try {
      const { username, password, name, role = 'user' } = userData;
      
      // 비밀번호 해싱
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      const [result] = await this.pool.execute(
        'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)',
        [username, hashedPassword, name, role]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('사용자 생성 오류:', error);
      throw error;
    }
  }

  // 사용자 정보 업데이트
  async update(id, userData) {
    try {
      const { name, role } = userData;
      
      const [result] = await this.pool.execute(
        'UPDATE users SET name = ?, role = ? WHERE id = ?',
        [name, role, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('사용자 업데이트 오류:', error);
      throw error;
    }
  }

  // 비밀번호 변경
  async changePassword(id, newPassword) {
    try {
      // 비밀번호 해싱
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      const [result] = await this.pool.execute(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('비밀번호 변경 오류:', error);
      throw error;
    }
  }

  // 비밀번호 확인
  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // 관리자 계정 생성 (서버 시작 시 호출)
  async createAdminIfNotExists() {
    try {
      // 기존 관리자 계정 확인
      const admin = await this.findByUsername('admin');
      
      if (admin) {
        console.log('관리자 계정이 이미 존재합니다.');
        return false;
      }
      
      // 관리자 계정 생성
      const adminId = await this.create({
        username: 'admin',
        password: 'admin123', // 실제 환경에서는 더 강력한 비밀번호를 사용하세요
        name: '관리자',
        role: 'admin'
      });
      
      console.log('관리자 계정이 성공적으로 생성되었습니다.');
      console.log('아이디: admin');
      console.log('비밀번호: admin123');
      
      return true;
    } catch (error) {
      console.error('관리자 계정 생성 오류:', error);
      return false;
    }
  }

  // 모든 사용자 조회
  async findAll() {
    try {
      console.log('findAll 함수 호출됨');
      
      // 테이블 구조 확인
      const [tableInfo] = await this.pool.execute('DESCRIBE users');
      console.log('users 테이블 구조:', tableInfo.map(col => col.Field));
      
      // 사용자 조회
      const [rows] = await this.pool.execute(
        'SELECT id, username, name, role FROM users'  // 컬럼 목록 간소화
      );
      console.log('조회된 사용자 수:', rows.length);
      console.log('첫 번째 사용자 데이터:', rows.length > 0 ? rows[0] : '없음');
      
      return rows;
    } catch (error) {
      console.error('사용자 목록 조회 오류:', error);
      throw error;
    }
  }

  // 사용자 삭제
  async delete(id) {
    try {
      const [result] = await this.pool.execute(
        'DELETE FROM users WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('사용자 삭제 오류:', error);
      throw error;
    }
  }

    // 검색 조건에 맞는 사용자 조회
  async search(criteria) {
    try {
      let query = `
        SELECT id, username, name, email, phone, role, status, 
               created_at, updated_at
        FROM users
        WHERE 1=1
      `;
      const params = [];
      
      if (criteria.name) {
        query += ` AND name LIKE ?`;
        params.push(`%${criteria.name}%`);
      }
      
      if (criteria.department) {
        query += ` AND department = ?`;
        params.push(criteria.department);
      }
      
      if (criteria.role) {
        query += ` AND role = ?`;
        params.push(criteria.role);
      }
      
      if (criteria.status) {
        query += ` AND status = ?`;
        params.push(criteria.status);
      }
      
      query += ` ORDER BY id DESC`;
      
      const [rows] = await this.pool.execute(query, params);
      return rows;
    } catch (error) {
      console.error('사용자 검색 오류:', error);
      throw error;
    }
  }

  // 여러 사용자의 상태 일괄 변경
  async bulkUpdateStatus(ids, status) {
    try {
      // MySQL에서는 IN 절에 배열을 직접 사용할 수 없으므로 
      // 쿼리 파라미터를 동적으로 생성
      const placeholders = ids.map(() => '?').join(',');
      const query = `
        UPDATE users
        SET status = ?,
            updated_at = NOW()
        WHERE id IN (${placeholders})
      `;
      
      const params = [status, ...ids];
      const [result] = await this.pool.execute(query, params);
      
      return result.affectedRows;
    } catch (error) {
      console.error('사용자 상태 일괄 변경 오류:', error);
      throw error;
    }
  }
  
}

module.exports = User;