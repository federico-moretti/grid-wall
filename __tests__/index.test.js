require('../setupTests');
const ReflowGrid = require('../dist/index').default;

const id = 'rg';
let rg = null;

function createContainerWithFiveChildren({ margin = 'center' } = {}) {
  document.body.innerHTML = `
  <div id="${id}" style="width: 500px;">
    <div id="i1" style="height:200px;">Item 1</div>
    <div id="i2" style="height:100px;">Item 2</div>
    <div id="i3" style="height:300px;">Item 3</div>
    <div id="i4" style="height:150px;">Item 4</div>
    <div id="i5" style="height:250px;">Item 5</div>
  </div>`;
  const container = document.getElementById(id);
  if (container) {
    rg = new ReflowGrid({ container, childrenWidthInPx: 100, enableResize: true, margin });
  }
}

function createContainerWithNoChildren() {
  document.body.innerHTML = `<div id="${id}" style="width: 500px;height:600px;"></div>`;
  const container = document.getElementById(id);
  if (container) {
    rg = new ReflowGrid({ container, childrenWidthInPx: 100 });
  }
}

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
    rg.reflow();
    const item5 = document.getElementById('i5');
    expect(item5.style.transform).toBe('translate(300px, 150px)');
  });

  it('should change to the lower column on the left', () => {
    createContainerWithFiveChildren();
    const item2 = document.getElementById('i2');
    item2.style.height = '150px';
    rg.reflow();
    const item5 = document.getElementById('i5');
    expect(item5.style.transform).toBe('translate(100px, 150px)');
  });

  it('should add classes to the DOM', () => {
    createContainerWithFiveChildren();
    expect(document.head.textContent).toContain('/* reflow grid */');
  });

  it('should get correct number of children', () => {
    createContainerWithFiveChildren();
    expect(rg.children.length).toBe(5);
  });

  it('should not crash with 0 children', () => {
    createContainerWithNoChildren();
    expect(rg.children.length).toBe(0);
  });

  it('should add class to container', () => {
    createContainerWithFiveChildren();
    const container = document.getElementById(id);
    expect(container.classList).toContain('rg-container');
  });

  it('should set new width to an element', () => {
    const element = document.createElement('div');
    element.style.width = '100px';
    expect(element.style.width).toBe('100px');
    ReflowGrid.setWidth(element, 200);
    expect(element.style.width).toBe('200px');
  });

  it('should track children height', () => {
    createContainerWithFiveChildren();
    const item1 = document.getElementById('i1');
    const item5 = document.getElementById('i5');
    expect(rg.childLastId).toBe(5);
    expect(item1.getAttribute('data-rg-id')).toBe('1');
    expect(item5.getAttribute('data-rg-id')).toBe('5');
    expect(rg.childrenHeights[1]).toBe(200);
    expect(rg.childrenHeights[5]).toBe(250);
  });

  it('should return lower column index and height', () => {
    createContainerWithFiveChildren();
    const lower = rg.getLowerColumn();
    expect(lower).toEqual({ index: 3, height: 150 });
  });

  it('should set new width to an element', () => {
    createContainerWithFiveChildren();
    const max = ReflowGrid.getMaxHeight([100, 200, 300, 50]);
    expect(max).toBe(300);
  });

  it('should calculate margin with less children', () => {
    createContainerWithFiveChildren();
    rg.resize(650);
    expect(rg.marginWidth).toBe(75);
  });

  it('should calculate margin with smaller width', () => {
    createContainerWithFiveChildren();
    rg.resize(400);
    expect(rg.marginWidth).toBe(0);
  });

  it('should calculate margin centered', () => {
    createContainerWithFiveChildren();
    rg.resize(450);
    expect(rg.marginWidth).toBe(25);
  });

  it('should calculate margin left', () => {
    createContainerWithFiveChildren({ margin: 'left' });
    rg.resize(450);
    expect(rg.marginWidth).toBe(50);
  });

  it('should calculate margin right', () => {
    createContainerWithFiveChildren({ margin: 'right' });
    rg.resize(450);
    expect(rg.marginWidth).toBe(0);
  });

  it.todo('should reflow');

  it('should resize', () => {
    createContainerWithFiveChildren();
    const spyReflow = jest.spyOn(rg, 'reflow');
    const spyCalculateMargin = jest.spyOn(rg, 'calculateMargin');
    const spyResetColumnsHeight = jest.spyOn(rg, 'resetColumnsHeight');

    rg.resize(450);

    expect(spyReflow).toHaveBeenCalledTimes(1);
    expect(spyCalculateMargin).toHaveBeenCalledTimes(1);
    expect(spyResetColumnsHeight).toHaveBeenCalledTimes(1);
    expect(rg.columnsCount).toBe(4);
  });

  it('should throw error on resize if missing width', () => {
    try {
      createContainerWithFiveChildren();
      rg.resize();
    } catch (error) {
      expect(error.message).toBe('Width must be a number and more than 0');
    }
  });

  it('should throw error on resize if width is not a number', () => {
    try {
      createContainerWithFiveChildren();
      rg.resize('number');
    } catch (error) {
      expect(error.message).toBe('Width must be a number and more than 0');
    }
  });

  it('should reflow after edit children height', done => {
    createContainerWithNoChildren();
    const spyReflow = jest.spyOn(rg, 'reflow');

    const element = document.createElement('div');
    element.setAttribute('data-rg-id', '2');
    element.style.height = '350px';
    const mutations = [{ target: element }];

    rg.childrenHeights['2'] = 200;

    rg.handleChildrenMutation(mutations, () => {
      expect(spyReflow).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('should reflow after adding a children', () => {
    createContainerWithFiveChildren();
    const spyReflow = jest.spyOn(rg, 'reflow');
    const spyGetChildren = jest.spyOn(rg, 'getChildren');
    const spySetWidth = jest.spyOn(ReflowGrid, 'setWidth');

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

    rg.handleContainerMutation(mutations, () => {
      expect(spyReflow).toHaveBeenCalledTimes(1);
      expect(spyGetChildren).toHaveBeenCalledTimes(1);
      expect(spySetWidth).toHaveBeenCalledTimes(1);
      expect(element.style.width).toBe('100px');
    });
  });

  it('should throw errors on missing 1 param', () => {
    try {
      new ReflowGrid({ childrenWidthInPx: 100 });
    } catch (error) {
      expect(error.message).toBe(`Missing 1 mandatory parameter:\n  container`);
    }
  });

  it('should throw errors on missing multiple params', () => {
    try {
      new ReflowGrid({});
    } catch (error) {
      expect(error.message).toBe(
        `Missing 2 mandatory parameters:\n  container\n  childrenWidthInPx`
      );
    }
  });

  it('should throw errors on missing params object', () => {
    try {
      new ReflowGrid();
    } catch (error) {
      expect(error.message).toBe(`Missing mandatory parameters!`);
    }
  });

  it.todo('should debounce');

  it.todo('should insert transitions');
});
