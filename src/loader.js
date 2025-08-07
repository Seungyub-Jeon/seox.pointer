(function () {
  const CHECKER_ID = 'seo-checker-host';
  const SERVER_URL = 'http://localhost:3000'; // This will be replaced by the build process in a real app

  // 1. Check if the checker is already on the page
  if (document.getElementById(CHECKER_ID)) {
    console.log('SEO Checker is already active.');
    return;
  }

  // 2. Create the host element and the shadow root
  const hostElement = document.createElement('div');
  hostElement.id = CHECKER_ID;
  document.body.appendChild(hostElement);

  const shadowRoot = hostElement.attachShadow({ mode: 'open' });

  // 3. Create the mount point for the Svelte app inside the shadow DOM
  const appMountPoint = document.createElement('div');
  appMountPoint.id = 'app';
  shadowRoot.appendChild(appMountPoint);

  // 4. Inject the bundled CSS into the shadow root
  const cssLink = document.createElement('link');
  cssLink.rel = 'stylesheet';
  // The filename will be determined by Vite's build output
  cssLink.href = `${SERVER_URL}/assets/index.css`; // Placeholder name
  shadowRoot.appendChild(cssLink);

  // 5. Inject the bundled JavaScript into the main document
  // The script needs to be in the main document to execute
  const script = document.createElement('script');
  script.type = 'module';
  // The filename will be determined by Vite's build output
  script.src = `${SERVER_URL}/assets/index.js`; // Placeholder name
  document.body.appendChild(script);

})();
