import conf from './config';
import Ads from './ads';

class AdsExtension {
  constructor({context}) {
    this.context = context;
    this.schedule = {};
    context.$ads = this;
    this.config();
  }

  config() {
    let newConfig = {
      ...conf,
    };
    if (this.context.config.ads) newConfig.ads = this.context.config.ads;
    this.context.$config.set(newConfig);
  }

  setup(){
    this.context.$event.listen('dp.view.rendered', () => {
      this.render();
    });
  }

  add(ads){
    if (ads) this.context.$config.set({
      ads
    });

    this.schedule = {};
    ads.forEach(data => {
      this.schedule['at-' + data.time] = data;
    });
  }

  render(){
    let player = this.context.$config.node('player');
    let ads = this.context.$config.get('ads');
    let adsClose = this.context.$config.node('adsClose');
    let runner = new Ads({context: this.context});
    
    if (ads) {
      this.add(ads);
    }

    adsClose.listen('click', () => {
      runner.close(true);
    });

    if (this.schedule['at-first']) {
      runner.run(this.schedule['at-first']);
      delete this.schedule['at-first'];
    }

    // Listen event when timeupdate
    player.listen('timeupdate', () => {
      if (this.context.$control.isPaused()) return;
      let current = this.context.$control.currentTime();
      let time = Math.floor(current);
      let key = 'at-' + time;

      if (this.schedule[key]) {
        runner.run(this.schedule[key]);
        delete this.schedule[key];
      }
    });
  }
}

export default AdsExtension;