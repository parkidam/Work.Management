/**
 * 사원 관리 페이지 관련 JavaScript 기능
 */

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    // 로그인 상태 확인
    checkLoginStatus();
    
    // 로그아웃 버튼 설정
    setupLogoutButton();
    
    // 사용자 정보 업데이트
    updateUserInfo();
    
    // 모달 관련 이벤트 설정
    setupModalEvents();
    
    // 테스트 데이터 로드 (실제 구현 시 API 호출로 대체)
    loadTestData();
});

// 모달 이벤트 설정
function setupModalEvents() {
    // 부양가족 추가 버튼 클릭
    document.getElementById('addFamilyBtn').addEventListener('click', function() {
        var familyModal = new bootstrap.Modal(document.getElementById('familyModal'));
        familyModal.show();
    });
    
    // 학력 추가 버튼 클릭
    document.getElementById('addEducationBtn').addEventListener('click', function() {
        var educationModal = new bootstrap.Modal(document.getElementById('educationModal'));
        educationModal.show();
    });
    
    // 자격증 추가 버튼 클릭
    document.getElementById('addCertificationBtn').addEventListener('click', function() {
        var certificationModal = new bootstrap.Modal(document.getElementById('certificationModal'));
        certificationModal.show();
    });
    
    // 경력 추가 버튼 클릭
    document.getElementById('addCareerBtn').addEventListener('click', function() {
        var careerModal = new bootstrap.Modal(document.getElementById('careerModal'));
        careerModal.show();
    });
    
    // 각 모달의 저장 버튼 이벤트 설정
    document.getElementById('saveFamilyBtn').addEventListener('click', saveFamilyInfo);
    document.getElementById('saveEducationBtn').addEventListener('click', saveEducationInfo);
    document.getElementById('saveCertificationBtn').addEventListener('click', saveCertificationInfo);
    document.getElementById('saveCareerBtn').addEventListener('click', saveCareerInfo);
    
    // 저장 버튼 클릭
    document.getElementById('saveBtn').addEventListener('click', saveEmployeeInfo);
    
    // 삭제 버튼 클릭
    document.getElementById('deleteBtn').addEventListener('click', deleteEmployee);
    
    // 경력증명서 출력 버튼 클릭
    document.getElementById('exportBtn').addEventListener('click', exportCareerCertificate);
}

// 테스트 데이터 로드 (실제 구현 시 API 호출로 대체)
function loadTestData() {
    // 사원 목록 테스트 데이터
    const employees = [
        { id: 'E001', name: '홍길동', department: '개발팀', position: '과장' },
        { id: 'E002', name: '김철수', department: '영업팀', position: '대리' },
        { id: 'E003', name: '이영희', department: '인사팀', position: '부장' }
    ];
    
    const employeeList = document.getElementById('employeeList');
    employeeList.innerHTML = '';
    
    employees.forEach(emp => {
        const div = document.createElement('div');
        div.className = 'employee-item';
        div.dataset.id = emp.id;
        div.innerHTML = `
            <strong>${emp.name}</strong> (${emp.id})<br>
            ${emp.department} / ${emp.position}
        `;
        div.addEventListener('click', function() {
            loadEmployeeDetails(emp.id);
            
            // 활성화된 항목 표시
            document.querySelectorAll('.employee-item').forEach(item => {
                item.classList.remove('active');
            });
            this.classList.add('active');
        });
        employeeList.appendChild(div);
    });
}

// 사원 상세 정보 로드 (실제 구현 시 API 호출로 대체)
function loadEmployeeDetails(employeeId) {
    // 테스트 데이터 (실제 구현 시 API 호출로 대체)
    const employeeData = {
        id: employeeId,
        name: employeeId === 'E001' ? '홍길동' : (employeeId === 'E002' ? '김철수' : '이영희'),
        rrn: '800101-1234567',
        phone: '010-1234-5678',
        email: 'employee@example.com',
        department: employeeId === 'E001' ? '개발팀' : (employeeId === 'E002' ? '영업팀' : '인사팀'),
        position: employeeId === 'E001' ? '과장' : (employeeId === 'E002' ? '대리' : '부장'),
        hireDate: '2020-01-01',
        status: '재직',
        address: '서울시 강남구 테헤란로 123',
        bankInfo: {
            bankName: '국민은행',
            accountNumber: '123-456-789'
        },
        family: [
            { relation: '배우자', name: '김미영', rrn: '810203-2345678' },
            { relation: '자', name: '홍준호', rrn: '100304-3456789' }
        ],
        education: [
            { 
                school: '서울대학교', 
                admissionDate: '2010-03-02', 
                graduationDate: '2014-02-28', 
                degree: '학사',
                diploma: '졸업장.pdf'
            }
        ],
        certification: [
            {
                name: '정보처리기사',
                issuer: '한국산업인력공단',
                issueDate: '2015-06-15',
                expiryDate: '',
                file: '자격증.pdf'
            }
        ],
        career: [
            {
                company: '(주)이전회사',
                contract: '시스템 개발',
                startDate: '2015-01-01',
                endDate: '2019-12-31',
                md: 120,
                role: '개발자'
            }
        ]
    };
    
    // 기본 정보 채우기
    document.getElementById('employeeId').value = employeeData.id;
    document.getElementById('employeeName').value = employeeData.name;
    document.getElementById('employeeRRN').value = employeeData.rrn;
    document.getElementById('employeePhone').value = employeeData.phone;
    document.getElementById('employeeEmail').value = employeeData.email;
    document.getElementById('employeeDepartment').value = employeeData.department;
    document.getElementById('employeePosition').value = employeeData.position;
    document.getElementById('hireDate').value = employeeData.hireDate;
    document.getElementById('employeeStatus').value = employeeData.status;
    document.getElementById('employeeAddress').value = employeeData.address;
    
    // 은행 정보 채우기
    document.getElementById('bankName').value = employeeData.bankInfo.bankName;
    document.getElementById('accountNumber').value = employeeData.bankInfo.accountNumber;
    
    // 부양가족 정보 채우기
    const familyTable = document.querySelector('#familyTable tbody');
    familyTable.innerHTML = '';
    employeeData.family.forEach((family, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${family.relation}</td>
            <td>${family.name}</td>
            <td>${family.rrn}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary edit-family" data-index="${index}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger delete-family" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        familyTable.appendChild(row);
    });
    
    // 학력 정보 채우기
    const educationTable = document.querySelector('#educationTable tbody');
    educationTable.innerHTML = '';
    employeeData.education.forEach((edu, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${edu.school}</td>
            <td>${edu.admissionDate}</td>
            <td>${edu.graduationDate}</td>
            <td>${edu.degree}</td>
            <td>${edu.diploma ? '<a href="#"><i class="fas fa-file-pdf"></i> 보기</a>' : '-'}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary edit-education" data-index="${index}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger delete-education" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        educationTable.appendChild(row);
    });
    
    // 자격증 정보 채우기
    const certificationTable = document.querySelector('#certificationTable tbody');
    certificationTable.innerHTML = '';
    employeeData.certification.forEach((cert, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${cert.name}</td>
            <td>${cert.issuer}</td>
            <td>${cert.issueDate}</td>
            <td>${cert.expiryDate || '무기한'}</td>
            <td>${cert.file ? '<a href="#"><i class="fas fa-file-pdf"></i> 보기</a>' : '-'}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary edit-certification" data-index="${index}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger delete-certification" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        certificationTable.appendChild(row);
    });
    
    // 경력 정보 채우기
    const careerTable = document.querySelector('#careerTable tbody');
    careerTable.innerHTML = '';
    employeeData.career.forEach((career, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${career.company}</td>
            <td>${career.contract}</td>
            <td>${career.startDate} ~ ${career.endDate}</td>
            <td>${career.md}</td>
            <td>${career.role}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary edit-career" data-index="${index}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger delete-career" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        careerTable.appendChild(row);
    });
    
    // 편집/삭제 버튼에 이벤트 리스너 추가
    setupTableButtonEvents();
}

// 테이블 버튼 이벤트 설정
function setupTableButtonEvents() {
    // 부양가족 편집/삭제 버튼
    document.querySelectorAll('.edit-family').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = this.dataset.index;
            editFamilyInfo(index);
        });
    });
    
    document.querySelectorAll('.delete-family').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = this.dataset.index;
            if (confirm('이 부양가족 정보를 삭제하시겠습니까?')) {
                this.closest('tr').remove();
            }
        });
    });
    
    // 학력 편집/삭제 버튼
    document.querySelectorAll('.edit-education').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = this.dataset.index;
            editEducationInfo(index);
        });
    });
    
    document.querySelectorAll('.delete-education').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = this.dataset.index;
            if (confirm('이 학력 정보를 삭제하시겠습니까?')) {
                this.closest('tr').remove();
            }
        });
    });
    
    // 자격증 편집/삭제 버튼
    document.querySelectorAll('.edit-certification').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = this.dataset.index;
            editCertificationInfo(index);
        });
    });
    
    document.querySelectorAll('.delete-certification').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = this.dataset.index;
            if (confirm('이 자격증 정보를 삭제하시겠습니까?')) {
                this.closest('tr').remove();
            }
        });
    });
    
    // 경력 편집/삭제 버튼
    document.querySelectorAll('.edit-career').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = this.dataset.index;
            editCareerInfo(index);
        });
    });
    
    document.querySelectorAll('.delete-career').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = this.dataset.index;
            if (confirm('이 경력 정보를 삭제하시겠습니까?')) {
                this.closest('tr').remove();
            }
        });
    });
}

// 부양가족 정보 저장
function saveFamilyInfo() {
    const relation = document.getElementById('familyRelation').value;
    const name = document.getElementById('familyName').value;
    const rrn = document.getElementById('familyRRN').value;
    
    if (!relation || !name) {
        alert('관계와 이름은 필수 입력 항목입니다.');
        return;
    }
    
    const familyTable = document.querySelector('#familyTable tbody');
    const newRow = document.createElement('tr');
    const index = familyTable.children.length;
    
    newRow.innerHTML = `
        <td>${relation}</td>
        <td>${name}</td>
        <td>${rrn}</td>
        <td>
            <button class="btn btn-sm btn-outline-primary edit-family" data-index="${index}">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger delete-family" data-index="${index}">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    familyTable.appendChild(newRow);
    
    // 모달 닫기
    bootstrap.Modal.getInstance(document.getElementById('familyModal')).hide();
    
    // 폼 초기화
    document.getElementById('familyForm').reset();
    
    // 새로 추가된 버튼에 이벤트 리스너 설정
    setupTableButtonEvents();
}

// 학력 정보 저장
function saveEducationInfo() {
    const school = document.getElementById('schoolName').value;
    const admissionDate = document.getElementById('admissionDate').value;
    const graduationDate = document.getElementById('graduationDate').value;
    const degree = document.getElementById('degree').value;
    const diplomaFile = document.getElementById('diplomaFile').files[0];
    
    if (!school || !admissionDate || !graduationDate || !degree) {
        alert('학교명, 입학일, 졸업일, 학위는 필수 입력 항목입니다.');
        return;
    }
    
    const educationTable = document.querySelector('#educationTable tbody');
    const newRow = document.createElement('tr');
    const index = educationTable.children.length;
    
    newRow.innerHTML = `
        <td>${school}</td>
        <td>${admissionDate}</td>
        <td>${graduationDate}</td>
        <td>${degree}</td>
        <td>${diplomaFile ? '<a href="#"><i class="fas fa-file-pdf"></i> 보기</a>' : '-'}</td>
        <td>
            <button class="btn btn-sm btn-outline-primary edit-education" data-index="${index}">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger delete-education" data-index="${index}">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    educationTable.appendChild(newRow);
    
    // 모달 닫기
    bootstrap.Modal.getInstance(document.getElementById('educationModal')).hide();
    
    // 폼 초기화
    document.getElementById('educationForm').reset();
    
    // 새로 추가된 버튼에 이벤트 리스너 설정
    setupTableButtonEvents();
}

// 자격증 정보 저장
function saveCertificationInfo() {
    const name = document.getElementById('certName').value;
    const issuer = document.getElementById('certIssuer').value;
    const issueDate = document.getElementById('certIssueDate').value;
    const expiryDate = document.getElementById('certExpiryDate').value;
    const certFile = document.getElementById('certFile').files[0];
    
    if (!name || !issuer || !issueDate) {
        alert('자격증명, 발급기관, 발급일은 필수 입력 항목입니다.');
        return;
    }
    
    const certificationTable = document.querySelector('#certificationTable tbody');
    const newRow = document.createElement('tr');
    const index = certificationTable.children.length;
    
    newRow.innerHTML = `
        <td>${name}</td>
        <td>${issuer}</td>
        <td>${issueDate}</td>
        <td>${expiryDate || '무기한'}</td>
        <td>${certFile ? '<a href="#"><i class="fas fa-file-pdf"></i> 보기</a>' : '-'}</td>
        <td>
            <button class="btn btn-sm btn-outline-primary edit-certification" data-index="${index}">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger delete-certification" data-index="${index}">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    certificationTable.appendChild(newRow);
    
    // 모달 닫기
    bootstrap.Modal.getInstance(document.getElementById('certificationModal')).hide();
    
    // 폼 초기화
    document.getElementById('certificationForm').reset();
    
    // 새로 추가된 버튼에 이벤트 리스너 설정
    setupTableButtonEvents();
}

// 경력 정보 저장
function saveCareerInfo() {
    const company = document.getElementById('companyName').value;
    const contract = document.getElementById('contractName').value;
    const startDate = document.getElementById('careerStartDate').value;
    const endDate = document.getElementById('careerEndDate').value;
    const md = document.getElementById('mdInput').value;
    const role = document.getElementById('roleInput').value;
    
    if (!company || !contract || !startDate || !endDate || !md || !role) {
        alert('모든 항목을 입력해주세요.');
        return;
    }
    
    const careerTable = document.querySelector('#careerTable tbody');
    const newRow = document.createElement('tr');
    const index = careerTable.children.length;
    
    newRow.innerHTML = `
        <td>${company}</td>
        <td>${contract}</td>
        <td>${startDate} ~ ${endDate}</td>
        <td>${md}</td>
        <td>${role}</td>
        <td>
            <button class="btn btn-sm btn-outline-primary edit-career" data-index="${index}">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger delete-career" data-index="${index}">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    careerTable.appendChild(newRow);
    
    // 모달 닫기
    bootstrap.Modal.getInstance(document.getElementById('careerModal')).hide();
    
    // 폼 초기화
    document.getElementById('careerForm').reset();
    
    // 새로 추가된 버튼에 이벤트 리스너 설정
    setupTableButtonEvents();
}

// 사원 정보 저장
function saveEmployeeInfo() {
    // 실제 구현 시 API 호출로 대체
    alert('사원 정보가 저장되었습니다.');
}

// 사원 삭제
function deleteEmployee() {
    const employeeId = document.getElementById('employeeId').value;
    if (!employeeId) {
        alert('삭제할 사원을 선택해주세요.');
        return;
    }
    
    if (confirm('이 사원 정보를 정말 삭제하시겠습니까?')) {
        // 실제 구현 시 API 호출로 대체
        alert('사원 정보가 삭제되었습니다.');
        document.getElementById('employeeForm').reset();
        
        // 목록에서도 제거
        const employeeItem = document.querySelector(`.employee-item[data-id="${employeeId}"]`);
        if (employeeItem) {
            employeeItem.remove();
        }
    }
}

// 경력증명서 출력
function exportCareerCertificate() {
    const employeeId = document.getElementById('employeeId').value;
    if (!employeeId) {
        alert('경력증명서를 출력할 사원을 선택해주세요.');
        return;
    }
    
    // 실제 구현 시 API 호출 또는 엑셀 생성 로직으로 대체
    alert('경력증명서가 엑셀 파일로 출력되었습니다.');
}

// 편집 함수 (나중에 구현)
function editFamilyInfo(index) {
    alert('부양가족 정보 편집 기능은 아직 구현되지 않았습니다.');
}

function editEducationInfo(index) {
    alert('학력 정보 편집 기능은 아직 구현되지 않았습니다.');
}

function editCertificationInfo(index) {
    alert('자격증 정보 편집 기능은 아직 구현되지 않았습니다.');
}

function editCareerInfo(index) {
    alert('경력 정보 편집 기능은 아직 구현되지 않았습니다.');
}