class Ads {
  context: any;
  ads: any;
  adsContent: any;
  panel: any;
  adsClose: any;
  timer: any;
  counter: number = 0;
  data: any;
  isRunning: boolean = false;
  videoState: boolean = false;

  constructor({ context }: any) {
    this.context = context;
    this.ads = this.context.$config.node('ads');
    this.adsContent = this.context.$config.node('adsContent');
    this.panel = this.context.$config.node('panel');
    this.adsClose = this.context.$config.node('adsClose');
  }

  setContent(data: any){
    if (data.content.type == 'image') {
      if (data.type == 'full') this.adsContent.html('<div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center;"><img src="' + data.content.src + '" style="max-height: 100%; max-width: 100%"/></div>');
      else this.adsContent.html('<img src="' + data.content.src + '" style="max-height: 100%; max-width: 100%"/>');
      this.counting();
    }

    if (data.content.type == 'video') {
      this.adsContent.html('<div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1"></div>');
      let vi = document.createElement('video');
      vi.src = data.content.src;
      vi.style.width = '100%';
      vi.style.height = '100%';
      vi.controls = false;
      // vi.autoplay = true;
      vi.volume = this.context.$control.volume();
      this.adsContent.append(vi);

      // Check if play is false
      vi.play().catch(() => {
        vi.muted = true;
        vi.play();
      });

      vi.addEventListener('play', () => {
        this.counting();
      });
    }
  }

  counting(){
    this.timer = null;
    this.counter = 0;

    let timeButton = (skip: boolean) => {
      if (this.counter == 0) return;
      if (skip) this.adsClose.html('Skip ad (' + this.counter + 's)');
      else this.adsClose.html('Will close in ' + this.counter + 's');
      this.counter--;
      window.setTimeout(() => {
        timeButton(skip);
      }, 1000);
    }

    if (this.data.type == 'full') {
      this.panel.hide();
      if (this.data.duration) {
        this.counter = this.data.duration;
        this.timer = window.setTimeout(() => {
          this.close(false);
        }, this.data.duration * 1000);

        timeButton(this.data.close);
      } else {
        this.adsClose.html('Skip ad');
      }
    } else {
      this.adsClose.html(this.context.$config.get('icons.closeAds'));
    }
  }

  run(data: any) {
    this.close(false);
    this.isRunning = true;
    this.data = data;
    this.adsClose.active(true);
    this.ads.active(true).removeClass('full').removeClass('line').addClass(this.data.type);

    if (this.data.type == 'full') {
      if (this.data.time == 'first') this.videoState = this.context.$config.get('autoplay');
      else this.videoState = !this.context.$control.isPaused();
      this.context.$control.pause();
    }

    this.setContent(this.data);
  }

  close(byuser: any) {
    if (!this.isRunning) return;
    if (byuser && this.data.duration && !this.data.close) return;
    window.clearTimeout(this.timer);
    this.counter = 0;
    this.adsContent.html('');
    this.context.$config.node('ads').active(false);
    this.context.$config.node('panel').show();

    if (this.data.type == 'full' && this.videoState) {      
      this.context.$control.dom.play().catch(() => {
        this.context.$control.dom.muted = true;
        this.context.$control.dom.play();
      });
    }

    this.isRunning = false;
  }
}

export default Ads;