document.addEventListener('DOMContentLoaded', function() {
    // IMPORTANTE: COLOQUE O URL DO SEU APPS SCRIPT AQUI!
    const appScriptURL = 'https://script.google.com/macros/s/AKfycbzyaU4gmFXV4d4Lj38nZOE81yEYungiVDAiYKAW6qMtxy1UI_YqrQ0sls6llUedFiu_/exec';

    const form = document.getElementById('presenceForm');
    const formSteps = Array.from(form.querySelectorAll('.form-step'));
    const progressBarFill = form.querySelector('.progress-bar-fill');
    const feedbackMessage = document.getElementById('feedbackMessage');
    
    let currentStep = 0;

    const goToStep = (stepIndex) => {
        currentStep = stepIndex;
        // Atualiza a classe 'active' para a animação CSS
        formSteps.forEach((step, index) => {
            step.classList.toggle('active-step', index === currentStep);
        });

        // Atualiza a barra de progresso
        const progress = (currentStep / (formSteps.length - 1)) * 100;
        progressBarFill.style.width = `${progress}%`;

        // Foca no primeiro campo da etapa para melhor UX
        const firstInput = formSteps[currentStep].querySelector('input, textarea');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 400); // Pequeno delay para a transição
        }
    };

    // Função para avançar para a próxima etapa com um pequeno delay
    const nextStep = () => {
        if (currentStep < formSteps.length - 1) {
            setTimeout(() => goToStep(currentStep + 1), 300); // Delay para o usuário ver a seleção
        }
    };

    // Adiciona os event listeners
    formSteps.forEach((step, index) => {
        // Para inputs de texto/textarea, avança com a tecla Enter
        const textInput = step.querySelector('input[type="text"], textarea');
        if (textInput) {
            textInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (textInput.value.trim() !== '' || !textInput.required) {
                        nextStep();
                    }
                }
            });
        }
        
        // Para o botão explícito de "Continuar" em campos não-obrigatórios
        const nextButton = step.querySelector('.next-button');
        if(nextButton) {
            nextButton.addEventListener('click', nextStep);
        }

        // Para radios e estrelas, avança automaticamente
        const radioInputs = step.querySelectorAll('input[type="radio"]');
        radioInputs.forEach(radio => {
            radio.addEventListener('change', nextStep);
        });

        // Adiciona atalhos de teclado (1, 2, 3...) para opções de escolha
        const choices = step.querySelectorAll('.choice-group label');
        choices.forEach((choice, choiceIndex) => {
            document.addEventListener('keydown', (e) => {
                if (step.classList.contains('active-step') && e.key === (choiceIndex + 1).toString()) {
                    choice.click();
                }
            });
        });
    });

    // Envio final do formulário
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = form.querySelector('.submit-button');
        submitButton.disabled = true;
        
        // Simula o loader (pode ser removido se o CSS for suficiente)
        submitButton.classList.add('loading'); 

        try {
            const response = await fetch(appScriptURL, {
                method: 'POST',
                body: new FormData(form)
            });

            if (response.ok) {
                feedbackMessage.textContent = 'Obrigado! Sua avaliação foi enviada. ✨';
                feedbackMessage.className = 'success';
                feedbackMessage.style.display = 'block';

                setTimeout(() => {
                    feedbackMessage.style.display = 'none';
                    form.reset();
                    goToStep(0); // Volta para a primeira pergunta
                }, 3000);
            } else {
                throw new Error(`Erro no envio: ${response.statusText}`);
            }
        } catch (error) {
            feedbackMessage.textContent = 'Ops! Algo deu errado. Tente novamente.';
            feedbackMessage.className = 'error';
            feedbackMessage.style.display = 'block';
            console.error(error);
        } finally {
            submitButton.disabled = false;
            submitButton.classList.remove('loading');
        }
    });

    // Inicia o formulário na primeira etapa
    goToStep(0);
});