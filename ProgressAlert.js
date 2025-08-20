class ProgressAlert {
    static SUCCESS = "success";
    static FAIL = "fail";
    static NEUTRAL = "neutral";
    static VERSION = 'V3';

    isPaused = false;
    segments = [];
    progress = 0;
    currentStep = 0;
    closed = false;
    status = 'created';
    finishedCalled = false;

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
            type: 'modal',
            position: "center",
            showCancelButton: false,
            cancelButtonText: "Cancel!",
            closeTimeout: 1300,
            stepDuration: 300
        };
        this.stepDuration = config.stepDuration ?? defaultConfig.stepDuration; // ms
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
        this.stepSize = 100 / this.steps;
        this.miniStepSize = this.stepSize / 10;
    }

    setProgress(progress, typeC) {
        if (progress < 0 || progress >= 100) {
            this.endProgress();
            return false;
        }

        this.animateTo(20, 1000); // animate from current progress to 20 over 1s
    }

    updateProgress(typeC) {
        const targetWidth = `${this.progress}%`;

        if (this.progressBar) {
            this.progressBar.style.width = targetWidth;
            this.progressBar.style.backgroundColor = typeC;
        }

        if (this.progress >= 100) {
            this.endProgress();
            return;
        }
    }

    updateProgressWithSteps(type) {
        if (!this.canContinue() || this.isPaused) return false;

        if (!this.isOpen())
            this.showProgressAlert();

        this.currentStep++;
        this.addProgressSegment(type, this.stepSize);
    }

    addProgressSegment(type, size) {
        let color;
        if (type === ProgressAlert.SUCCESS) {
            color = this.progressColorSuccess;
        } else if (type === ProgressAlert.FAIL) {
            color = this.progressColorError;
        } else if (type === ProgressAlert.NEUTRAL) {
            color = this.progressColorNeutral;
        } else {
            color = this.progressColor;
        }


        if (!this.segments) this.segments = [];

        // Push with placeholder size (we’ll animate into it)
        this.segments.push({ color, size });

        const targetProgress = Math.min(this.progress + size, 100);

        // Animate smoothly
        this.animateTo(targetProgress, this.stepDuration);

        if (targetProgress >= 100) {
            // Delay finish until animation is done
            setTimeout(() => this.endProgress(), this.stepDuration + 10);
        }
    }


    renderSegments() {
        let gradientParts = [];
        let cumulative = 0;

        for (let i = 0; i < this.segments.length; i++) {
            const seg = this.segments[i];
            let start = cumulative;
            let end = cumulative + seg.size;

            start = +(start.toFixed(4));

            if (i < this.segments.length - 1) {
                // fully completed segment
                end = +(end.toFixed(4));
                gradientParts.push(`${seg.color} ${start}% ${end}%`);
                cumulative = end;
            } else {
                // active segment: only draw up to this.progress
                end = Math.min(this.progress, end);
                end = +(end.toFixed(4));
                gradientParts.push(`${seg.color} ${start}% ${end}%`);
                cumulative = end;
            }
        }

        this.progressBar.style.width = this.progress + "%";
        this.progressBar.style.background = `linear-gradient(to right, ${gradientParts.join(", ")})`;
    }


    animateTo(nextProgress, duration = 500) {
        if (this.animationFrame) cancelAnimationFrame(this.animationFrame);

        const start = this.progress;
        const end = Math.min(nextProgress, 100);
        const startTime = performance.now();

        const step = (now) => {
            const elapsed = now - startTime;
            const ratio = Math.min(elapsed / duration, 1);

            // Smooth interpolation
            this.progress = start + (end - start) * ratio;

            this.renderSegments();

            if (ratio < 1) {
                this.animationFrame = requestAnimationFrame(step);
            } else {
                this.progress = end;
                this.renderSegments();
                this.animationFrame = null;
            }
        };

        this.animationFrame = requestAnimationFrame(step);
    }


    simulateProgress() {
        const progressInterval = setInterval(() => {
            this.setProgress(this.progress + this.miniStepSize);

            if (this.progress >= 100) {
                clearInterval(progressInterval);
                this.endProgress();
            }
        }, 50);
    }

    demo() {
        let l = 0;
        const i = setInterval(() => {
            l++;
            this.updateMessage(`Progress: ${Math.floor(this.progress + this.stepSize)}%`);
            this.updateProgressWithSteps([ProgressAlert.SUCCESS, ProgressAlert.NEUTRAL, ProgressAlert.FAIL][Math.floor(Math.random() * 3)])
            if (l >= this.steps) clearInterval(i);
        }, 1000);
    }

    updateMessage(text) {
        if (!text) return;
        this.messageContainer.innerText = text;
    }

    updateSteps(stepsS) {
        if (!this.canContinue()) return false;

        this.steps = stepsS;
        this.stepSize = 100 / this.steps;
        this.miniStepSize = this.stepSize / 10;
    }

    showProgressAlert() {
        if (this.status !== 'created') return;

        const id = 'progress-dialog';
        if (!document.querySelector('#progress-dialog')) {
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
                border-radius: 40px;
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

        if (typeof Swal === 'undefined' || !Swal) {
            throw new Error("SweetAlert2 (Swal) is not defined. Are you sure you have included its scripts?");
        }

        this.alertSwal = Swal.mixin({
            title: this.title,
            toast: this.type === 'toast',
            position: this.position,
            html: document.getElementById('progress-dialog'),
            showCancelButton: !!this.showCancelButton,
            showConfirmButton: false,
            allowEscapeKey: false,
            allowOutsideClick: this.allowOutsideClick,
            willClose: () => {
                this.endProgress('user');
            },
            didOpen: () => {
                this.onOpened();
            }
        });


        if (this.showCancelButton) {
            this.alertSwal.cancelButtonText = this.cancelButtonText;
            this.alertSwal.closeOnCancel = true;
        }

        this.alertSwal.fire();
    }

    reset() {
        this.closed = false;
        this.progress = 0;
        this.finishedCalled = false;
        this.stepSize = 100 / this.steps;
        this.miniStepSize = this.stepSize / 10;
        this.isPaused = false;
        this.segments = []
        if (this.progressBar) {
            this.progressBar.style.width = "0%";
            this.progressBar.style.background = this.progressColor;
        }
        this.status = "created";
    }

    canContinue() {
        return !this.closed && !this.isFinished() && this.status !== 'closed';
    }

    isFinished() {
        return this.progress >= 100;
    }

    isOpen() {
        return this.alertSwal.isVisible() || false;
    }

    onOpened() {
        this.status = 'opened';
        if (typeof this.onOpen === 'function')
            this.onOpen();
    }

    endProgress() {
        if (this.finishedCalled) return;
        this.finishedCalled = true;
        setTimeout(() => {
            this.alertSwal.close(); // Close the dialog when progress reaches 100%
            this.closed = true;
            this.status = 'closed';
            if (typeof this.onFinish === 'function')
                this.onFinish(this);
        }, this.closeTimeout);
    }

    stop() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
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

console.log("%cProgressAlert version " + ProgressAlert.VERSION, iniconfig);