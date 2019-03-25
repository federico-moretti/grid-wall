import { ReflowGrid } from '../dist/index';

describe('Reflow Grid', () => {
  const id = 'rg';
  let reflow = null;
  // prepare
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up our document body
    document.body.innerHTML = `
<div id="${id}" style="width: 500px;">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
  <div>Item 4</div>
  <div>Item 5</div>
</div>
    `;
    const container = document.getElementById(id);
    if (container) {
      console.log(container);
      console.log(container.style);
      console.log(container.style.width);
      reflow = new ReflowGrid({ container, childrenWidth: 100 });
    }
  });

  it('', () => {
    console.log(document.body.innerHTML);
  });
});
