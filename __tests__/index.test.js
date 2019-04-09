require('../setupTests');
const GridWall = require('../dist/index').default;

const id = 'gw';
let gw = null;

function createContainerWithFiveChildren({ width = '500px', margin = 'center' } = {}) {
  document.body.innerHTML = `
  <div id="${id}" style="width: ${width};">
    <div id="i1" style="height:200px;">Item 1</div>
    <div id="i2" style="height:100px;">Item 2</div>
    <div id="i3" style="height:300px;">Item 3</div>
    <div id="i4" style="height:150px;">Item 4</div>
    <div id="i5" style="height:250px;">Item 5</div>
  </div>`;
  const container = document.getElementById(id);
  if (container) {
    gw = new GridWall({ container, childrenWidthInPx: 100, enableResize: true, margin });
  }
}

function createContainerWithNoChildren() {
  document.body.innerHTML = `<div id="${id}" style="width: 500px;height:600px;"></div>`;
  const container = document.getElementById(id);
  if (container) {
    gw = new GridWall({ container, childrenWidthInPx: 100 });
  }
}

jest.useFakeTimers();

describe('Reflow Grid', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should apply correct transform properties', () => {
    createContainerWithFiveChildren();
    const item1 = document.getElementById('i1');
    const item2 = document.getElementById('i2');
    const item3 = document.getElementById('i3');
    const item4 = document.getElementById('i4');
    const item5 = document.getElementById('i5');
    expect(item1.style.transform).toBe('translate(0px, 0px)');
    expect(item2.style.transform).toBe('translate(100px, 0px)');
    expect(item3.style.transform).toBe('translate(200px, 0px)');
    expect(item4.style.transform).toBe('translate(300px, 0px)');
    expect(item5.style.transform).toBe('translate(100px, 100px)');
  });

  it('should change to the lower column', () => {
    createContainerWithFiveChildren();
    const item2 = document.getElementById('i2');
    item2.style.height = '180px';
    gw.reflow();
    const item5 = document.getElementById('i5');
    expect(item5.style.transform).toBe('translate(300px, 150px)');
  });

  it('should change to the lower column on the left', () => {
    createContainerWithFiveChildren();
    const item2 = document.getElementById('i2');
    item2.style.height = '150px';
    gw.reflow();
    const item5 = document.getElementById('i5');
    expect(item5.style.transform).toBe('translate(100px, 150px)');
  });

  it('should add classes to the DOM', () => {
    createContainerWithFiveChildren();
    expect(document.head.textContent).toContain('/* grid-wall */');
  });

  it('should get correct number of children', () => {
    createContainerWithFiveChildren();
    expect(gw.children.length).toBe(5);
  });

  it('should not crash with 0 children', () => {
    createContainerWithNoChildren();
    expect(gw.children.length).toBe(0);
  });

  it('should add class to container', () => {
    createContainerWithFiveChildren();
    const container = document.getElementById(id);
    expect(container.classList).toContain('gw-container');
  });

  it('should set new width to an element', () => {
    const element = document.createElement('div');
    element.style.width = '100px';
    expect(element.style.width).toBe('100px');
    GridWall.setWidth(element, 200);
    expect(element.style.width).toBe('200px');
  });

  it('should track children height', () => {
    createContainerWithFiveChildren();
    const item1 = document.getElementById('i1');
    const item5 = document.getElementById('i5');
    expect(gw.childLastId).toBe(5);
    expect(item1.getAttribute('data-gw-id')).toBe('1');
    expect(item5.getAttribute('data-gw-id')).toBe('5');
    expect(gw.childrenHeights[1]).toBe(200);
    expect(gw.childrenHeights[5]).toBe(250);
  });

  it('should return lower column index and height', () => {
    createContainerWithFiveChildren();
    const lower = gw.getLowerColumn();
    expect(lower).toEqual({ index: 3, height: 150 });
  });

  it('should set new width to an element', () => {
    createContainerWithFiveChildren();
    const max = GridWall.getMaxHeight([100, 200, 300, 50]);
    expect(max).toBe(300);
  });

  it('should calculate margin with less children', () => {
    createContainerWithFiveChildren();
    gw.resize(650);
    expect(gw.marginWidth).toBe(75);
  });

  it('should calculate margin with smaller width', () => {
    createContainerWithFiveChildren();
    gw.resize(400);
    expect(gw.marginWidth).toBe(0);
  });

  it('should calculate margin centered', () => {
    createContainerWithFiveChildren();
    gw.resize(450);
    expect(gw.marginWidth).toBe(25);
  });

  it('should calculate margin left', () => {
    createContainerWithFiveChildren({ margin: 'left' });
    gw.resize(450);
    expect(gw.marginWidth).toBe(50);
  });

  it('should calculate margin right', () => {
    createContainerWithFiveChildren({ margin: 'right' });
    gw.resize(450);
    expect(gw.marginWidth).toBe(0);
  });

  it('should calculate margin with no columns', () => {
    createContainerWithFiveChildren({ width: '50px' });
    expect(gw.marginWidth).toBe(0);
    expect(gw.columnsCount).toBe(0);
  });

  it.todo('should test reflow deeply');

  it('should resize', () => {
    createContainerWithFiveChildren();
    const spyReflow = jest.spyOn(gw, 'reflow');
    const spyCalculateMargin = jest.spyOn(gw, 'calculateMargin');
    const spyResetColumnsHeight = jest.spyOn(gw, 'resetColumnsHeight');

    gw.resize(450);

    expect(spyReflow).toHaveBeenCalledTimes(1);
    expect(spyCalculateMargin).toHaveBeenCalledTimes(1);
    expect(spyResetColumnsHeight).toHaveBeenCalledTimes(1);
    expect(gw.columnsCount).toBe(4);
  });

  it('should throw error on resize if missing width', () => {
    try {
      createContainerWithFiveChildren();
      gw.resize();
    } catch (error) {
      expect(error.message).toBe('Width must be a number and more than 0');
    }
  });

  it('should throw error on resize if width is not a number', () => {
    try {
      createContainerWithFiveChildren();
      gw.resize('number');
    } catch (error) {
      expect(error.message).toBe('Width must be a number and more than 0');
    }
  });

  it('should reflow after edit children height', done => {
    createContainerWithNoChildren();
    const spyReflow = jest.spyOn(gw, 'reflow');

    const element = document.createElement('div');
    element.setAttribute('data-gw-id', '2');
    element.style.height = '350px';
    const mutations = [{ target: element }];

    gw.childrenHeights['2'] = 200;

    gw.handleChildrenMutation(mutations, () => {
      expect(spyReflow).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('should reflow after adding a children', () => {
    createContainerWithFiveChildren();
    const spyReflow = jest.spyOn(gw, 'reflow');
    const spyGetChildren = jest.spyOn(gw, 'getChildren');
    const spySetWidth = jest.spyOn(GridWall, 'setWidth');

    const container = document.getElementById(id);
    const element = document.createElement('div');
    element.style.height = '350px';
    element.textContent = 'New Item!';
    container.appendChild(element);

    const mutations = [
      {
        type: 'childList',
        addedNodes: [element],
      },
    ];

    gw.handleContainerMutation(mutations, () => {
      expect(spyReflow).toHaveBeenCalledTimes(1);
      expect(spyGetChildren).toHaveBeenCalledTimes(1);
      expect(spySetWidth).toHaveBeenCalledTimes(1);
      expect(element.style.width).toBe('100px');
    });
  });

  it('should throw errors on missing 1 param', () => {
    try {
      new GridWall({ childrenWidthInPx: 100 });
    } catch (error) {
      expect(error.message).toBe(`Missing 1 mandatory parameter:\n  container`);
    }
  });

  it('should throw errors on missing multiple params', () => {
    try {
      new GridWall({});
    } catch (error) {
      expect(error.message).toBe(
        `Missing 2 mandatory parameters:\n  container\n  childrenWidthInPx`
      );
    }
  });

  it('should throw errors on missing params object', () => {
    try {
      new GridWall();
    } catch (error) {
      expect(error.message).toBe(`Missing mandatory parameters!`);
    }
  });

  it('should debounce', () => {
    const callback = jest.fn();

    GridWall.debounce(callback, 200)();
    jest.runAllTimers();

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should add styles', () => {
    // mock html element cause jsdom mess up the styles property
    const element = {
      style: {
        width: '10px',
        transition: 'none',
      },
    };

    GridWall.addStyles(element, {
      width: '100px',
      transition: 'opacity 0.2s ease-in, transform 0.2s ease-in',
    });

    expect(element.style.width).toBe('100px');
    expect(element.style.transition).toBe('opacity 0.2s ease-in, transform 0.2s ease-in');
  });

  it('should insert transitions in reflow', () => {
    createContainerWithFiveChildren();

    const spyAddStyles = jest.spyOn(GridWall, 'addStyles');
    gw.reflow();

    expect(spyAddStyles).toHaveBeenCalledTimes(5);
  });

  it('should add transition data attribute', () => {
    createContainerWithFiveChildren();
    const element = document.createElement('div');

    gw.addAfterStyle({ target: element });

    expect(element.getAttribute('data-gw-transition')).toBe('true');
  });
});
