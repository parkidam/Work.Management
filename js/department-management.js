/**
 * 부서 관리 페이지 관련 JavaScript 기능
 */

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    // 로그인 상태 확인
    checkLoginStatus();
    
    // 로그아웃 버튼 설정
    setupLogoutButton();
    
    // 사용자 정보 업데이트
    updateUserInfo();
    
    // 부서 관련 이벤트 설정
    setupDepartmentEvents();
    
    // 테스트 데이터 로드 (실제 구현 시 API 호출로 대체)
    loadDepartmentData();
    
    // 조직도 표시
    renderOrganizationChart();
});

// 부서 관련 이벤트 설정
function setupDepartmentEvents() {
    // 신규 부서 버튼 클릭
    document.getElementById('addDepartmentBtn').addEventListener('click', function() {
        clearDepartmentForm();
        // 새 부서 코드 생성 (실제 구현 시 API에서 제공)
        document.getElementById('departmentId').value = generateDepartmentId();
        document.getElementById('createDate').value = new Date().toISOString().split('T')[0];
    });
    
    // 부서장 선택 버튼 클릭
    document.getElementById('selectManagerBtn').addEventListener('click', function() {
        // 부서장 선택 모달 표시
        var managerModal = new bootstrap.Modal(document.getElementById('managerModal'));
        loadManagerCandidates();
        managerModal.show();
    });
    
    // 부서장 검색 버튼 클릭
    document.getElementById('managerSearchBtn').addEventListener('click', function() {
        const searchTerm = document.getElementById('managerSearchInput').value;
        searchManagers(searchTerm);
    });
    
    // 부서 검색 버튼 클릭
    document.getElementById('searchBtn').addEventListener('click', function() {
        const searchTerm = document.getElementById('departmentSearch').value;
        searchDepartments(searchTerm);
    });
    
    // 부서 검색 입력란 엔터 키 이벤트
    document.getElementById('departmentSearch').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const searchTerm = this.value;
            searchDepartments(searchTerm);
        }
    });
    
    // 저장 버튼 클릭
    document.getElementById('saveBtn').addEventListener('click', saveDepartment);
    
    // 삭제 버튼 클릭
    document.getElementById('deleteBtn').addEventListener('click', deleteDepartment);
}

// 부서 데이터 로드 (실제 구현 시 API 호출로 대체)
function loadDepartmentData() {
    // 테스트 데이터 - 부서 목록
    const departments = [
        { id: 'D001', name: '경영지원팀', manager: 'E003', parent: null, status: 'active', createDate: '2020-01-01', description: '회사의 경영 지원 및 행정 업무를 담당하는 부서' },
        { id: 'D002', name: '인사팀', manager: 'E003', parent: 'D001', status: 'active', createDate: '2020-01-01', description: '인사 관리 및 채용을 담당하는 부서' },
        { id: 'D003', name: '회계팀', manager: 'E005', parent: 'D001', status: 'active', createDate: '2020-01-01', description: '회계 및 재무 관리를 담당하는 부서' },
        { id: 'D004', name: '개발팀', manager: 'E001', parent: null, status: 'active', createDate: '2020-01-01', description: '소프트웨어 개발을 담당하는 부서' },
        { id: 'D005', name: '프론트엔드팀', manager: 'E007', parent: 'D004', status: 'active', createDate: '2020-01-01', description: '프론트엔드 개발을 담당하는 부서' },
        { id: 'D006', name: '백엔드팀', manager: 'E010', parent: 'D004', status: 'active', createDate: '2020-01-01', description: '백엔드 개발을 담당하는 부서' },
        { id: 'D007', name: '영업팀', manager: 'E006', parent: null, status: 'active', createDate: '2020-01-01', description: '영업 및 마케팅을 담당하는 부서' },
        { id: 'D008', name: '국내영업팀', manager: 'E002', parent: 'D007', status: 'active', createDate: '2020-01-01', description: '국내 영업을 담당하는 부서' },
        { id: 'D009', name: '해외영업팀', manager: null, parent: 'D007', status: 'inactive', createDate: '2020-01-01', description: '해외 영업을 담당하는 부서 (현재 비활성)' }
    ];
    
    // 부서 목록 표시
    displayDepartmentList(departments);
    
    // 상위 부서 선택 옵션 채우기
    populateParentDepartments(departments);
}

// 부서 목록 표시
function displayDepartmentList(departments) {
    const departmentList = document.getElementById('departmentList');
    departmentList.innerHTML = '';
    
    departments.forEach(dept => {
        const div = document.createElement('div');
        div.className = 'list-group-item list-group-item-action department-item';
        if (dept.status === 'inactive') {
            div.classList.add('text-muted');
        }
        div.dataset.id = dept.id;
        div.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <strong>${dept.name}</strong> (${dept.id})
                    ${dept.status === 'inactive' ? '<span class="badge bg-secondary ms-2">비활성</span>' : ''}
                </div>
                <i class="fas fa-chevron-right text-muted"></i>
            </div>
        `;
        div.addEventListener('click', function() {
            loadDepartmentDetails(dept.id);
            
            // 활성화된 항목 표시
            document.querySelectorAll('.department-item').forEach(item => {
                item.classList.remove('active');
            });
            this.classList.add('active');
        });
        departmentList.appendChild(div);
    });
}

// 상위 부서 선택 옵션 채우기
function populateParentDepartments(departments) {
    const parentSelect = document.getElementById('parentDepartment');
    
    // 기존 옵션 초기화 (첫 번째 '없음' 옵션은 유지)
    while (parentSelect.options.length > 1) {
        parentSelect.remove(1);
    }
    
    // 부서 옵션 추가
    departments.forEach(dept => {
        if (dept.status === 'active') {  // 활성 상태인 부서만 추가
            const option = document.createElement('option');
            option.value = dept.id;
            option.textContent = `${dept.name} (${dept.id})`;
            parentSelect.appendChild(option);
        }
    });
}

// 부서 상세 정보 로드 (실제 구현 시 API 호출로 대체)
function loadDepartmentDetails(departmentId) {
    // 테스트 데이터 - 부서 상세 정보
    const departmentData = {
        'D001': {
            id: 'D001',
            name: '경영지원팀',
            manager: 'E003',
            managerName: '이영희',
            parent: null,
            status: 'active',
            createDate: '2020-01-01',
            description: '회사의 경영 지원 및 행정 업무를 담당하는 부서',
            members: [
                { id: 'E003', name: '이영희', position: '부장', hireDate: '2015-01-01', status: '재직' },
                { id: 'E005', name: '최민준', position: '차장', hireDate: '2016-07-01', status: '재직' },
                { id: 'E009', name: '임재현', position: '과장', hireDate: '2019-03-01', status: '재직' }
            ]
        },
        'D002': {
            id: 'D002',
            name: '인사팀',
            manager: 'E003',
            managerName: '이영희',
            parent: 'D001',
            status: 'active',
            createDate: '2020-01-01',
            description: '인사 관리 및 채용을 담당하는 부서',
            members: [
                { id: 'E008', name: '윤서연', position: '사원', hireDate: '2022-04-01', status: '재직' }
            ]
        },
        'D003': {
            id: 'D003',
            name: '회계팀',
            manager: 'E005',
            managerName: '최민준',
            parent: 'D001',
            status: 'active',
            createDate: '2020-01-01',
            description: '회계 및 재무 관리를 담당하는 부서',
            members: []
        },
        'D004': {
            id: 'D004',
            name: '개발팀',
            manager: 'E001',
            managerName: '홍길동',
            parent: null,
            status: 'active',
            createDate: '2020-01-01',
            description: '소프트웨어 개발을 담당하는 부서',
            members: [
                { id: 'E001', name: '홍길동', position: '과장', hireDate: '2018-03-01', status: '재직' },
                { id: 'E004', name: '박지원', position: '사원', hireDate: '2022-02-01', status: '재직' },
                { id: 'E007', name: '강다은', position: '대리', hireDate: '2020-05-01', status: '재직' },
                { id: 'E010', name: '오민석', position: '부장', hireDate: '2017-01-01', status: '재직' }
            ]
        },
        'D005': {
            id: 'D005',
            name: '프론트엔드팀',
            manager: 'E007',
            managerName: '강다은',
            parent: 'D004',
            status: 'active',
            createDate: '2020-01-01',
            description: '프론트엔드 개발을 담당하는 부서',
            members: [
                { id: 'E007', name: '강다은', position: '대리', hireDate: '2020-05-01', status: '재직' }
            ]
        },
        'D006': {
            id: 'D006',
            name: '백엔드팀',
            manager: 'E010',
            managerName: '오민석',
            parent: 'D004',
            status: 'active',
            createDate: '2020-01-01',
            description: '백엔드 개발을 담당하는 부서',
            members: [
                { id: 'E001', name: '홍길동', position: '과장', hireDate: '2018-03-01', status: '재직' },
                { id: 'E004', name: '박지원', position: '사원', hireDate: '2022-02-01', status: '재직' },
                { id: 'E010', name: '오민석', position: '부장', hireDate: '2017-01-01', status: '재직' }
            ]
        },
        'D007': {
            id: 'D007',
            name: '영업팀',
            manager: 'E006',
            managerName: '정수진',
            parent: null,
            status: 'active',
            createDate: '2020-01-01',
            description: '영업 및 마케팅을 담당하는 부서',
            members: [
                { id: 'E002', name: '김철수', position: '대리', hireDate: '2019-06-01', status: '재직' },
                { id: 'E006', name: '정수진', position: '이사', hireDate: '2015-05-01', status: '재직' }
            ]
        },
        'D008': {
            id: 'D008',
            name: '국내영업팀',
            manager: 'E002',
            managerName: '김철수',
            parent: 'D007',
            status: 'active',
            createDate: '2020-01-01',
            description: '국내 영업을 담당하는 부서',
            members: [
                { id: 'E002', name: '김철수', position: '대리', hireDate: '2019-06-01', status: '재직' }
            ]
        },
        'D009': {
            id: 'D009',
            name: '해외영업팀',
            manager: null,
            managerName: '',
            parent: 'D007',
            status: 'inactive',
            createDate: '2020-01-01',
            description: '해외 영업을 담당하는 부서 (현재 비활성)',
            members: []
        }
    };
    
    // 선택한 부서 ID에 해당하는 데이터 가져오기
    const deptData = departmentData[departmentId] || {
        id: departmentId,
        name: '신규 부서',
        manager: null,
        managerName: '',
        parent: null,
        status: 'active',
        createDate: new Date().toISOString().split('T')[0],
        description: '',
        members: []
    };
    
    // 폼에 데이터 채우기
    document.getElementById('departmentId').value = deptData.id;
    document.getElementById('departmentName').value = deptData.name;
    document.getElementById('managerId').value = deptData.manager || '';
    document.getElementById('managerName').value = deptData.managerName || '';
    document.getElementById('parentDepartment').value = deptData.parent || '';
    document.getElementById('departmentStatus').value = deptData.status;
    document.getElementById('createDate').value = deptData.createDate;
    document.getElementById('departmentDesc').value = deptData.description;
    
    // 부서 구성원 표시
    displayDepartmentMembers(deptData.members);
}

// 부서 구성원 표시
function displayDepartmentMembers(members) {
    const memberTable = document.querySelector('#memberTable tbody');
    memberTable.innerHTML = '';
    
    if (members.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="5" class="text-center">구성원이 없습니다.</td>';
        memberTable.appendChild(row);
        return;
    }
    
    members.forEach(member => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${member.id}</td>
            <td>${member.name}</td>
            <td>${member.position}</td>
            <td>${member.hireDate}</td>
            <td>${member.status}</td>
        `;
        memberTable.appendChild(row);
    });
}

// 부서장 후보 목록 로드 (실제 구현 시 API 호출로 대체)
function loadManagerCandidates() {
    // 테스트 데이터 - 사원 목록
    const employees = [
        { id: 'E001', name: '홍길동', department: '개발팀', position: '과장' },
        { id: 'E002', name: '김철수', department: '영업팀', position: '대리' },
        { id: 'E003', name: '이영희', department: '인사팀', position: '부장' },
        { id: 'E004', name: '박지원', department: '개발팀', position: '사원' },
        { id: 'E005', name: '최민준', department: '경영지원팀', position: '차장' },
        { id: 'E006', name: '정수진', department: '영업팀', position: '이사' },
        { id: 'E007', name: '강다은', department: '개발팀', position: '대리' },
        { id: 'E008', name: '윤서연', department: '인사팀', position: '사원' },
        { id: 'E009', name: '임재현', department: '경영지원팀', position: '과장' },
        { id: 'E010', name: '오민석', department: '개발팀', position: '부장' }
    ];
    
    displayManagerCandidates(employees);
}

// 부서장 후보 목록 표시
function displayManagerCandidates(employees) {
    const managerTable = document.querySelector('#managerTable tbody');
    managerTable.innerHTML = '';
    
    employees.forEach(emp => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${emp.id}</td>
            <td>${emp.name}</td>
            <td>${emp.department}</td>
            <td>${emp.position}</td>
            <td>
                <button class="btn btn-sm btn-primary select-manager" data-id="${emp.id}" data-name="${emp.name}">
                    선택
                </button>
            </td>
        `;
        managerTable.appendChild(row);
    });
    
    // 선택 버튼에 이벤트 리스너 추가
    document.querySelectorAll('.select-manager').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.dataset.id;
            const name = this.dataset.name;
            
            // 선택한 부서장 정보 설정
            document.getElementById('managerId').value = id;
            document.getElementById('managerName').value = name;
            
            // 모달 닫기
            bootstrap.Modal.getInstance(document.getElementById('managerModal')).hide();
        });
    });
}

// 부서장 검색
function searchManagers(searchTerm) {
    // 실제 구현 시 API 호출로 대체
    loadManagerCandidates();
    
    if (!searchTerm) return;
    
    // 클라이언트 측 필터링 (임시)
    const rows = document.querySelectorAll('#managerTable tbody tr');
    rows.forEach(row => {
        const name = row.cells[1].textContent.toLowerCase();
        if (name.includes(searchTerm.toLowerCase())) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// 부서 검색
function searchDepartments(searchTerm) {
    // 실제 구현 시 API 호출로 대체
    
    if (!searchTerm) {
        loadDepartmentData();
        return;
    }
    
    // 클라이언트 측 필터링 (임시)
    const items = document.querySelectorAll('.department-item');
    items.forEach(item => {
        const name = item.querySelector('strong').textContent.toLowerCase();
        if (name.includes(searchTerm.toLowerCase())) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

// 부서 저장
function saveDepartment() {
    const departmentId = document.getElementById('departmentId').value;
    const departmentName = document.getElementById('departmentName').value;
    const managerId = document.getElementById('managerId').value;
    const parentDepartment = document.getElementById('parentDepartment').value;
    const departmentStatus = document.getElementById('departmentStatus').value;
    const departmentDesc = document.getElementById('departmentDesc').value;
    
    if (!departmentName) {
        alert('부서명을 입력해주세요.');
        return;
    }
    
    // 실제 구현 시 API 호출로 대체
    alert('부서 정보가 저장되었습니다.');
    
    // 부서 목록 새로고침
    loadDepartmentData();
    
    // 조직도 업데이트
    renderOrganizationChart();
}

// 부서 삭제
function deleteDepartment() {
    const departmentId = document.getElementById('departmentId').value;
    
    if (!departmentId) {
        alert('삭제할 부서를 선택해주세요.');
        return;
    }
    
    if (confirm('이 부서를 정말 삭제하시겠습니까? 하위 부서와 구성원 정보도 함께 영향을 받을 수 있습니다.')) {
        // 실제 구현 시 API 호출로 대체
        alert('부서가 삭제되었습니다.');
        
        // 폼 초기화
        clearDepartmentForm();
        
        // 부서 목록 새로고침
        loadDepartmentData();
        
        // 조직도 업데이트
        renderOrganizationChart();
    }
}

// 부서 폼 초기화
function clearDepartmentForm() {
    document.getElementById('departmentForm').reset();
    document.getElementById('departmentId').value = '';
    document.getElementById('managerId').value = '';
    document.getElementById('managerName').value = '';
    
    // 부서 구성원 테이블 초기화
    const memberTable = document.querySelector('#memberTable tbody');
    memberTable.innerHTML = '<tr><td colspan="5" class="text-center">구성원이 없습니다.</td></tr>';
}

// 새 부서 코드 생성 (실제 구현 시 API에서 제공)
function generateDepartmentId() {
    // 기존 부서 ID 중 가장 큰 번호 찾기
    const items = document.querySelectorAll('.department-item');
    let maxNum = 0;
    
    items.forEach(item => {
        const id = item.dataset.id;
        if (id && id.startsWith('D')) {
            const num = parseInt(id.substring(1));
            if (!isNaN(num) && num > maxNum) {
                maxNum = num;
            }
        }
    });
    
    // 다음 번호 생성
    const nextNum = maxNum + 1;
    return `D${nextNum.toString().padStart(3, '0')}`;
}

// 조직도 렌더링
function renderOrganizationChart() {
    // 테스트 데이터 - 부서 계층 구조
    const departments = [
        { id: 'D001', name: '경영지원팀', manager: '이영희', parent: null },
        { id: 'D002', name: '인사팀', manager: '이영희', parent: 'D001' },
        { id: 'D003', name: '회계팀', manager: '최민준', parent: 'D001' },
        { id: 'D004', name: '개발팀', manager: '홍길동', parent: null },
        { id: 'D005', name: '프론트엔드팀', manager: '강다은', parent: 'D004' },
        { id: 'D006', name: '백엔드팀', manager: '오민석', parent: 'D004' },
        { id: 'D007', name: '영업팀', manager: '정수진', parent: null },
        { id: 'D008', name: '국내영업팀', manager: '김철수', parent: 'D007' },
        { id: 'D009', name: '해외영업팀', manager: '', parent: 'D007', inactive: true }
    ];
    
    // 계층 구조 생성
    const hierarchy = buildHierarchy(departments);
    
    // 조직도 HTML 생성
    const orgChart = document.getElementById('orgChart');
    orgChart.innerHTML = generateOrgChartHTML(hierarchy);
}

// 계층 구조 생성
function buildHierarchy(departments) {
    // 최상위 부서 (parent가 null인 부서)
    const rootDepartments = departments.filter(dept => !dept.parent);
    
    // 각 최상위 부서에 대해 하위 부서 추가
    return rootDepartments.map(dept => {
        return {
            ...dept,
            children: getChildDepartments(dept.id, departments)
        };
    });
}

// 하위 부서 가져오기 (재귀적)
function getChildDepartments(parentId, departments) {
    const children = departments.filter(dept => dept.parent === parentId);
    
    return children.map(child => {
        return {
            ...child,
            children: getChildDepartments(child.id, departments)
        };
    });
}

// 조직도 HTML 생성
function generateOrgChartHTML(departments) {
    if (!departments || departments.length === 0) {
        return '<div class="text-center">표시할 조직도가 없습니다.</div>';
    }
    
    let html = '<ul class="org-tree">';
    
    departments.forEach(dept => {
        html += generateDepartmentNodeHTML(dept);
    });
    
    html += '</ul>';
    return html;
}

// 부서 노드 HTML 생성 (재귀적)
function generateDepartmentNodeHTML(dept) {
    let html = `
        <li>
            <div class="org-node ${dept.inactive ? 'inactive' : ''}">
                <div class="org-name">${dept.name}</div>
                <div class="org-manager">${dept.manager || '(공석)'}</div>
            </div>
    `;
    
    if (dept.children && dept.children.length > 0) {
        html += '<ul>';
        dept.children.forEach(child => {
            html += generateDepartmentNodeHTML(child);
        });
        html += '</ul>';
    }
    
    html += '</li>';
    return html;
}