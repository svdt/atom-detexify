'use babel';

export default class DetexifyView {

  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('detexify');

    // Create elements
    const main = document.createElement('div');

    const detexify = document.createElement('div');
    detexify.id = 'detexify';
    const canvas = document.createElement('div');
    canvas.id = 'detexify-canvas';

    const clear = document.createElement('div');
    clear.id = 'detexify-clear';
    clear.textContent = '×';
    const drawhere = document.createElement('div');
    drawhere.id = 'detexify-drawhere';
    const results = document.createElement('div');
    results.id = 'detexify-results';
    this.results = document.createElement('ul');
    this.results.id = 'detexify-results-ul';

    results.appendChild(this.results);

    canvas.appendChild(clear);
    canvas.appendChild(drawhere);
    detexify.appendChild(canvas);
    detexify.appendChild(results);

    main.appendChild(detexify);
    this.element.appendChild(main);
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

  addResult(results){
    this.results.innerHTML = '';
    for (var i = 0; i < results.length; i++) {
        var li = document.createElement('li');

        var symbol = document.createElement('div');
        symbol.classList.add('symbol');
        var img = document.createElement('img');
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        img.className = results[i].symbol.css_class;
        symbol.appendChild(img);

        var info = document.createElement('div');
        info.classList.add('info');
        var score = document.createElement('span');
        score.classList.add('score');
        score.textContent = 'Score: '+results[i].score;
        info.appendChild(score);

        if(results[i].symbol.package){
          var pack = document.createElement('code');
          pack.classList.add('package');
          pack.textContent = '\u005Cusepackage{'+results[i].symbol.package+'}';
          info.appendChild(pack);
        }
        var command = document.createElement('code');
        command.classList.add('command');
        command.textContent = results[i].symbol.command;
        info.appendChild(command);

        var mode = document.createElement('span');
        mode.classList.add('mode');
        if(results[i].symbol.mathmode && results[i].symbol.textmode){
          mode.textContent = 'mathmode, textmode';
        } else if(results[i].symbol.mathmode){
          mode.textContent = 'mathmode';
        } else if(results[i].symbol.textmode){
          mode.textContent = 'textmode';
        }
        info.appendChild(mode);

        li.appendChild(symbol);
        li.appendChild(info);
        this.results.appendChild(li);
    }
  }

}
