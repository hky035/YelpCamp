// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
    'use strict'


    bsCustomFileInput.init();

    /* 
    querySelectorAll을 통해 현재 페이지에 class 속성으로 nedds-validation으로 설정된 폼을 다 찾고
    그 폼들이 제출 될때 유효성 검사를 한뒤 유효하지 않으면 이벤트를 멈춘다.  */

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation')

    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            }

            form.classList.add('was-validated')
        }, false)
    })
})()