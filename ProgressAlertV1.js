/* 
       https://github.com/frosmoon/ProgressAlert.js
       Made with ❤️ By Luis (frosmoon) at https://github.com/frosmoon/
       Website: https://byluis.studio 
*/
class ProgressAlert {
    static SUCCESS = "success";
    static FAIL = "fail";
    static NEUTRAL = "neutral";
    constructor(config = {}) {
        const defaultConfig = {
            steps: 5,
            title: 'Processing',
            message: 'Please wait...',
            progressColor: 'blue',
            progressColorSuccess: 'lime',
            progressColorError: 'red',
            progressColorNeutral: 'orange',
            progressBackgroundColor: 'darkblue',
            onFinish: null,
            onOpen: null,
            type: 'alert',
            position: "center",
            showCancelButton: false,
            cancelButtonText: "Cancel!",
            closeTimeout: 1300
        };

        this.steps = config.steps ?? defaultConfig.steps;
        this.title = config.title ?? defaultConfig.title;
        this.message = config.message ?? defaultConfig.message;
        this.progressColor = config.progressColor ?? defaultConfig.progressColor;
        this.progressColorSuccess = config.progressColorSuccess ?? defaultConfig.progressColorSuccess;
        this.progressColorError = config.progressColorError ?? defaultConfig.progressColorError;
        this.progressColorNeutral = config.progressColorNeutral ?? defaultConfig.progressColorNeutral;
        this.progressBackgroundColor = config.progressBackgroundColor ?? defaultConfig.progressBackgroundColor;
        this.onFinish = config.onFinish ?? defaultConfig.onFinish;
        this.onOpen = config.onOpen ?? defaultConfig.onOpen;
        this.type = config.type ?? defaultConfig.type;
        this.allowOutsideClick = (this.type === 'modal' ? false : true);
        this.position = this.type === 'toast' ?
            (config.position !== 'top-left' ? config.position ?? defaultConfig.position : defaultConfig.position) :
            defaultConfig.position;
        this.showCancelButton = config.showCancelButton ?? defaultConfig.showCancelButton;
        this.cancelButtonText = config.cancelButtonText ?? defaultConfig.cancelButtonText;
        this.progressBar = document.createElement('div');
        this.closeTimeout = config.closeTimeout ?? defaultConfig.closeTimeout;
        this.progress = 0;
        this.stepSize = 100 / this.steps;
        this.miniStepSize = this.stepSize / 10;
        this.closed = false;
        this.version = 'V3';
        this.status = 'created';
    }

    setProgress(progress, typeC) {
        if (progress < 0 || progress > 101) {
            return false;
        }

        this.progress = progress;
        this.updateProgress(typeC);
    }

    updateProgress(typeC) {
        const targetWidth = `${this.progress}%`;

        if (this.progressBar) {
            this.progressBar.style.width = targetWidth;
            this.progressBar.style.backgroundColor = typeC;
        }

        if (this.progress >= 90) {
            if (this.progressBar) this.progressBar.style.borderRadius = '40px';
            if (this.progressContainer) this.progressContainer.style.borderRadius = '40px';
        }

        if (this.progress >= 100) {
            this.endProgress();
            return;
        }

        this.updated('progress');
    }

    updateProgressWithSteps(type) {
        if (!this.canContinue()) return false;

        const typeC = type === ProgressAlert.SUCCESS ? this.progressColorSuccess :
            type === ProgressAlert.FAIL ? this.progressColorError :
                type === ProgressAlert.NEUTRAL ? this.progressColorNeutral :
                    this.progressColor;

        this.setProgress(this.progress + this.stepSize, typeC);
    }

    simulateProgress() {
        const progressInterval = setInterval(() => {
            this.setProgress(this.progress + this.miniStepSize);

            if (this.progress >= 100) {
                clearInterval(progressInterval);
            }
        }, 50);
    }

    demo() {
        let l = 0;
        while (l++ < this.steps) {
            setTimeout(() => {
                this.updateProgressWithSteps('success');
                this.updateMessage(`Progress: ${this.progress}%`);
            }, l * 500);
        }
    }

    updateMessage(text) {
        if (!text) return;
        this.messageContainer.innerText = text;
        this.updated('message');
    }

    updateSteps(stepsS) {
        if (!this.canContinue()) return false;

        this.steps = stepsS;
        this.stepSize = 100 / this.steps;
        this.miniStepSize = this.stepSize / 10;
        this.updated('steps');
    }

    showProgressAlert() {
        if (this.status !== 'created') return;

        const id = 'progress-dialog';
        if (!document.querySelector('#' + id)) {
            const html = `
        <div>
            <p id="message">${this.message || 'Please wait...'}</p>
            <div class="progress">
                <div class="progress-bar"></div>
            </div>
        </div>
        `;
            const el = document.createElement('div');
            el.id = id;
            el.innerHTML = html;
            document.body.appendChild(el);
        }

        if (!document.querySelector('#progress_style')) {
            const style = document.createElement('style');
            style.id = 'progress_style';
            style.innerHTML = `
             .progress-bar {
                height: 30px;
                width: 0%;
                border-radius: 40px 10px 10px 40px;
                transition: border-radius 0.5s;
            }
            .progress {
                background-color: ${this.progressBackgroundColor || 'cornflowerblue'};
                border-radius: 40px;
                transition: width 0.5s;
            }`;
            document.head.appendChild(style);
        }

        this.progressBar = document.querySelector('.progress-bar');
        this.progressContainer = document.querySelector('.progress');
        this.messageContainer = document.querySelector('#message');

        if (typeof Swal === 'undefined') {
            throw new Error("SweetAlert2 (Swal) is not defined.");
        }

        this.alertSwal = Swal.mixin({
            title: this.title,
            toast: this.type === 'toast',
            position: this.position,
            html: document.getElementById('progress-dialog'),
            showCancelButton: !!this.showCancelButton,
            showConfirmButton: false,
            allowEscapeKey: false,
            willClose: () => {
                this.endProgress('user');
            },
            didOpen: () => {
                this.onOpened();
            }
        });

        if (this.type !== 'toast') {
            this.alertSwal.allowOutsideClick = this.allowOutsideClick;
        }

        if (this.showCancelButton) {
            this.alertSwal.cancelButtonText = this.cancelButtonText;
            this.alertSwal.closeOnCancel = true;
        }

        this.alertSwal.fire();
    }

    reset() {
        this.closed = false;
        this.progress = 0;
        this.stepSize = 100 / this.steps;
        this.miniStepSize = this.stepSize / 10;
        this.status = 'recreated';
        this.updated();
    }

    updated(from) {
        if (!this.isOpen() && !this.showCancelButton) {
            this.showProgressAlert();
        }
    }

    canContinue() {
        return !this.closed && !this.isFinished() && this.status !== 'closed';
    }

    isFinished() {
        return this.progress >= 100;
    }

    isOpen() {
        return this.alertSwal?.isVisible?.() || false;
    }

    onOpened() {
        this.status = 'opened';
        this.updated('onOpen');
        if (typeof this.onOpen === 'function')
            this.onOpen();
    }

    isReallyClosed(from) {
        return this.canContinue() && !this.showCancelButton;
    }

    endProgress(from) {
        this.updated('endProgress');

        setTimeout(() => {
            this.alertSwal.close(); // Close the dialog when progress reaches 100%
            if (typeof this.onFinish === 'function') {
                this.onFinish();
            }
            this.closed = true;
            this.status = 'closed';
        }, this.closeTimeout);
    }
}

const iniconfig = [
    "margin-left:35%",
    "background-color: blueviolet",
    "padding: 10px",
    "color: #ffffff",
    "font-family: 'Courier New', Courier, monospace",
    "font-weight: bold",
    "font-size: larger",
    "border-radius:8px"
].join(' ;');

console.log("%cProgress API V3", iniconfig);