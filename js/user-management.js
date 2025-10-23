/**
 * 사용자관리 페이지 스크립트
 * 사용자 목록 조회, 추가, 수정, 삭제 등의 기능을 처리합니다.
 */

document.addEventListener('DOMContentLoaded', function() {
    // DataTable 초기화
    const userTable = $('#userTable').DataTable({
        paging: true,
        searching: false, // 내장 검색 비활성화 (커스텀 검색 사용)
        ordering: true,
        info: true,
        language: {
            emptyTable: "데이터가 없습니다",
            info: "총 _TOTAL_개 항목 중 _START_-_END_ 표시",
            infoEmpty: "표시할 항목이 없습니다",
            infoFiltered: "(전체 _MAX_ 개 항목에서 필터링됨)",
            lengthMenu: "_MENU_ 개씩 보기",
            loadingRecords: "로딩중...",
            processing: "처리중...",
            zeroRecords: "검색 결과가 없습니다",
            paginate: {
                first: "처음",
                last: "마지막",
                next: "다음",
                previous: "이전"
            }
        },
        dom: '<"row"<"col-sm-12"tr>><"row"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>',
        columnDefs: [
            { orderable: false, targets: [0, 9] } // 체크박스와 관리 버튼 열은 정렬 비활성화
        ],
        ajax: {
            url: '/api/user',
            type: 'GET',
            data: function() {
                return {
                    name: $('#searchName').val().trim(),
                    department: $('#searchDepartment').val(),
                    role: $('#searchRole').val(),
                    status: $('#searchStatus').val()
                };
            },
            dataSrc: function (json) {
                if (Array.isArray(json)) return json;
                if (Array.isArray(json.data)) return json.data;
                if (Array.isArray(json.list)) return json.list;
                return [];
            },
            error: function (xhr) {
                console.error('사용자 목록 조회 실패:', xhr.responseText);
            }
        },
        columns: [
            {
                data: null,
                render: (data, type, row) =>
                    `<div class="form-check">
                        <input class="form-check-input" type="checkbox" value="${row.userId}">
                    </div>`

            },
            { data: 'userId',     defaultContent: '-' },
            { data: 'name',       defaultContent: '-' },
            { data: 'username',   defaultContent: '-' },
            { data: 'email',      defaultContent: '-' },
            { data: 'department', defaultContent: '-' },
            {
            data: 'role', defaultContent: '-',
            render: (d) => d === 'admin' ? '<span class="badge bg-danger">관리자</span>'
                : d === 'manager'       ? '<span class="badge bg-primary">매니저</span>'
                :                         '<span class="badge bg-secondary">일반사용자</span>'
            },
            {
            data: 'status', defaultContent: '-',
            render: (d) => d === 'active'
                ? '<span class="badge bg-success">활성</span>'
                : '<span class="badge bg-secondary">비활성</span>'
            },
            {
            data: 'lastLogin', defaultContent: '-',
            render: (d) => d ? new Date(d).toISOString().slice(0,10) : '-'
            },
            {
            data: null, orderable: false,
            render: (data, type, row) => `
                <div class="btn-group btn-group-sm">
                <button type="button" class="btn btn-primary" data-bs-toggle="modal"
                        data-bs-target="#editUserModal" data-user-id="${row.userId}">
                    <i class="fas fa-edit"></i>
                </button>
                <button type="button" class="btn btn-warning" data-bs-toggle="modal"
                        data-bs-target="#resetPasswordModal" data-user-id="${row.userId}">
                    <i class="fas fa-key"></i>
                </button>
                <button type="button" class="btn btn-danger" data-bs-toggle="modal"
                        data-bs-target="#deleteUserModal" data-user-id="${row.userId}">
                    <i class="fas fa-trash"></i>
                </button>
                </div>`
            }
        ]
    });

    // 전체 선택 체크박스 이벤트
    $('#selectAll').on('change', function() {
        const isChecked = $(this).prop('checked');
        $('.form-check-input[type="checkbox"]').not(this).prop('checked', isChecked);
    });

    // 검색 폼 제출 이벤트
    $('#userSearchForm').on('submit', function(e) {
        e.preventDefault();
        searchUsers();
    });

    // 검색 초기화 버튼 이벤트
    $('#userSearchForm button[type="reset"]').on('click', function() {
        $('#userSearchForm')[0].reset();
        searchUsers();
    });

    // 사용자 검색 함수
    function searchUsers() {
    userTable.ajax.reload();   // ← 서버로 파라미터 전송 + 재조회
    }

    $('#userSearchForm').on('submit', function(e) {
    e.preventDefault();
    searchUsers();
    });

    $('#userSearchForm button[type="reset"]').on('click', function() {
    $('#userSearchForm')[0].reset();
    // reset은 즉시 값이 안 비워질 수 있으니 약간 딜레이 후 재조회
    setTimeout(() => searchUsers(), 0);
    });

    // 비밀번호 표시/숨김 토글 기능
    function setupPasswordToggle(inputId, buttonId) {
        $(buttonId).on('click', function() {
            const input = $(inputId);
            const icon = $(this).find('i');
            
            if (input.attr('type') === 'password') {
                input.attr('type', 'text');
                icon.removeClass('fa-eye').addClass('fa-eye-slash');
            } else {
                input.attr('type', 'password');
                icon.removeClass('fa-eye-slash').addClass('fa-eye');
            }
        });
    }

    // 비밀번호 토글 설정
    setupPasswordToggle('#userPassword', '#togglePassword');
    setupPasswordToggle('#userPasswordConfirm', '#togglePasswordConfirm');
    setupPasswordToggle('#newPassword', '#toggleNewPassword');
    setupPasswordToggle('#confirmNewPassword', '#toggleConfirmNewPassword');

    // 사용자 추가 모달 이벤트
    $('#addUserModal').on('show.bs.modal', function() {
        // 모달 열릴 때 폼 초기화
        $('#addUserForm')[0].reset();
    });

    // 사용자 추가 저장 버튼 클릭 이벤트
    $('#saveUserBtn').on('click', function() {
        // 폼 유효성 검사
        const form = $('#addUserForm')[0];
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // 비밀번호 일치 여부 확인
        const password = $('#userPassword').val();
        const confirmPassword = $('#userPasswordConfirm').val();
        
        if (password !== confirmPassword) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        // 폼 데이터 수집
        const userData = {
            name: $('#userName').val(),
            username: $('#userUsername').val(),
            email: $('#userEmail').val(),
            phone: $('#userPhone').val(),
            department: $('#userDepartment').val(),
            position: $('#userPosition').val(),
            role: $('#userRole').val(),
            status: $('#userStatus').val(),
            password: password,
            sendWelcomeEmail: $('#sendWelcomeEmail').prop('checked')
        };

        // 사용자 추가 API 호출 (실제 환경에서 구현)
        console.log('사용자 추가 데이터:', userData);
        
        // 성공 메시지 표시 및 모달 닫기 (실제로는 API 응답 후 처리)
        alert('사용자가 성공적으로 추가되었습니다.');
        $('#addUserModal').modal('hide');
        
        // 테이블 새로고침 (실제로는 API 응답 데이터로 테이블 업데이트)
    });

    // 사용자 수정 모달 이벤트
    $('#editUserModal').on('show.bs.modal', function(event) {
        const button = $(event.relatedTarget);
        const userId = button.data('user-id');
        
        // 사용자 ID를 모달에 저장
        $('#editUserId').val(userId);
        
        // 실제 환경에서는 서버에서 사용자 정보를 가져와 폼에 채웁니다.
        // 여기서는 예시 데이터로 폼 채우기
        if (userId === 1) {
            $('#editUserName').val('홍길동');
            $('#editUserUsername').val('admin');
            $('#editUserEmail').val('admin@vision-it.co.kr');
            $('#editUserPhone').val('010-1234-5678');
            $('#editUserDepartment').val('admin');
            $('#editUserPosition').val('director');
            $('#editUserRole').val('admin');
            $('#editUserStatus').val('active');
        } else if (userId === 2) {
            $('#editUserName').val('김영희');
            $('#editUserUsername').val('yhkim');
            $('#editUserEmail').val('yhkim@vision-it.co.kr');
            $('#editUserPhone').val('010-2345-6789');
            $('#editUserDepartment').val('sales');
            $('#editUserPosition').val('manager');
            $('#editUserRole').val('manager');
            $('#editUserStatus').val('active');
        } else if (userId === 3) {
            $('#editUserName').val('이철수');
            $('#editUserUsername').val('cslee');
            $('#editUserEmail').val('cslee@vision-it.co.kr');
            $('#editUserPhone').val('010-3456-7890');
            $('#editUserDepartment').val('dev');
            $('#editUserPosition').val('staff');
            $('#editUserRole').val('user');
            $('#editUserStatus').val('inactive');
        }
    });

    // 사용자 수정 저장 버튼 클릭 이벤트
    $('#updateUserBtn').on('click', function() {
        // 폼 유효성 검사
        const form = $('#editUserForm')[0];
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // 폼 데이터 수집
        const userData = {
            id: $('#editUserId').val(),
            name: $('#editUserName').val(),
            username: $('#editUserUsername').val(),
            email: $('#editUserEmail').val(),
            phone: $('#editUserPhone').val(),
            department: $('#editUserDepartment').val(),
            position: $('#editUserPosition').val(),
            role: $('#editUserRole').val(),
            status: $('#editUserStatus').val(),
            sendUpdateEmail: $('#sendUpdateEmail').prop('checked')
        };

        // 사용자 수정 API 호출 (실제 환경에서 구현)
        console.log('사용자 수정 데이터:', userData);
        
        // 성공 메시지 표시 및 모달 닫기 (실제로는 API 응답 후 처리)
        alert('사용자 정보가 성공적으로 수정되었습니다.');
        $('#editUserModal').modal('hide');
        
        // 테이블 새로고침 (실제로는 API 응답 데이터로 테이블 업데이트)
    });

    // 비밀번호 초기화 모달 이벤트
    $('#resetPasswordModal').on('show.bs.modal', function(event) {
        const button = $(event.relatedTarget);
        const userId = button.data('user-id');
        
        // 사용자 ID를 모달에 저장
        $('#resetPasswordUserId').val(userId);
        
        // 폼 초기화
        $('#newPassword').val('');
        $('#confirmNewPassword').val('');
        $('#sendResetEmail').prop('checked', true);
    });

    // 비밀번호 초기화 버튼 클릭 이벤트
    $('#resetPasswordBtn').on('click', function() {
        const userId = $('#resetPasswordUserId').val();
        const newPassword = $('#newPassword').val();
        const confirmNewPassword = $('#confirmNewPassword').val();
        
        if (!newPassword) {
            alert('새 비밀번호를 입력해주세요.');
            return;
        }
        
        if (newPassword !== confirmNewPassword) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }
        
        // 비밀번호 초기화 API 호출 (실제 환경에서 구현)
        const resetData = {
            userId: userId,
            newPassword: newPassword,
            sendEmail: $('#sendResetEmail').prop('checked')
        };
        
        console.log('비밀번호 초기화 데이터:', resetData);
        
        // 성공 메시지 표시 및 모달 닫기 (실제로는 API 응답 후 처리)
        alert('비밀번호가 성공적으로 초기화되었습니다.');
        $('#resetPasswordModal').modal('hide');
    });

    // 사용자 삭제 모달 이벤트
    $('#deleteUserModal').on('show.bs.modal', function(event) {
        const button = $(event.relatedTarget);
        const userId = button.data('user-id');
        
        // 사용자 ID를 모달에 저장
        $('#deleteUserId').val(userId);
    });

    // 사용자 삭제 버튼 클릭 이벤트
    $('#deleteUserBtn').on('click', function() {
        const userId = $('#deleteUserId').val();
        
        // 사용자 삭제 API 호출 (실제 환경에서 구현)
        console.log('삭제할 사용자 ID:', userId);
        
        // 성공 메시지 표시 및 모달 닫기 (실제로는 API 응답 후 처리)
        alert('사용자가 성공적으로 삭제되었습니다.');
        $('#deleteUserModal').modal('hide');
        
        // 테이블 새로고침 (실제로는 해당 행 제거)
    });

    // 일괄 활성화 버튼 클릭 이벤트
    $('#bulkActivate').on('click', function() {
        const selectedIds = [];
        
        // 선택된 사용자 ID 수집
        $('.form-check-input:checked').not('#selectAll').each(function() {
            selectedIds.push($(this).val());
        });
        
        if (selectedIds.length === 0) {
            alert('활성화할 사용자를 선택해주세요.');
            return;
        }
        
        // 일괄 활성화 API 호출 (실제 환경에서 구현)
        console.log('활성화할 사용자 ID 목록:', selectedIds);
        
        // 성공 메시지 표시 (실제로는 API 응답 후 처리)
        alert(selectedIds.length + '명의 사용자가 활성화되었습니다.');
        
        // 테이블 새로고침 (실제로는 API 응답 데이터로 테이블 업데이트)
    });

    // 일괄 비활성화 버튼 클릭 이벤트
    $('#bulkDeactivate').on('click', function() {
        const selectedIds = [];
        
        // 선택된 사용자 ID 수집
        $('.form-check-input:checked').not('#selectAll').each(function() {
            selectedIds.push($(this).val());
        });
        
        if (selectedIds.length === 0) {
            alert('비활성화할 사용자를 선택해주세요.');
            return;
        }
        
        // 일괄 비활성화 API 호출 (실제 환경에서 구현)
        console.log('비활성화할 사용자 ID 목록:', selectedIds);
        
        // 성공 메시지 표시 (실제로는 API 응답 후 처리)
        alert(selectedIds.length + '명의 사용자가 비활성화되었습니다.');
        
        // 테이블 새로고침 (실제로는 API 응답 데이터로 테이블 업데이트)
    });

    // Excel 내보내기 버튼 클릭 이벤트
    $('#exportExcel').on('click', function() {
        // Excel 내보내기 로직 (실제 환경에서 구현)
        alert('사용자 목록이 Excel 파일로 내보내기 되었습니다.');
    });

    // PDF 내보내기 버튼 클릭 이벤트
    $('#exportPdf').on('click', function() {
        // PDF 내보내기 로직 (실제 환경에서 구현)
        alert('사용자 목록이 PDF 파일로 내보내기 되었습니다.');
    });
});