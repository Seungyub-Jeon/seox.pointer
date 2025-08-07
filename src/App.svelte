<script>
  import { onMount } from 'svelte';
  // Import all our new analysis modules
  import { analyzeOverview } from './lib/analysis/overview.js';
  import { analyzeHeadings } from './lib/analysis/headings.js';
  import { analyzeLinks } from './lib/analysis/links.js';
  import { analyzeImages } from './lib/analysis/images.js';
  import { analyzeSchema } from './lib/analysis/schema.js';
  import { analyzeSocial } from './lib/analysis/social.js';
  import { analyzeKeywords } from './lib/analysis/content.js';
  import Overview from './lib/components/Overview.svelte';
  import Headings from './lib/components/Headings.svelte';
  import Links from './lib/components/Links.svelte';
  import Images from './lib/components/Images.svelte';
  import Schema from './lib/components/Schema.svelte';
  import Social from './lib/components/Social.svelte';
  import Content from './lib/components/Content.svelte';

  // --- State ---
  let analysisData = null;
  let activeTab = 'overview';
  let isLoading = true;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'headings', label: 'Headings' },
    { id: 'links', label: 'Links' },
    { id: 'images', label: 'Images' },
    { id: 'schema', label: 'Schema' },
    { id: 'social', label: 'Social' },
    { id: 'content', label: 'Content' },
  ];

  // --- Lifecycle ---
  onMount(() => {
    // In a real bookmarklet, `window` would be the host page's window.
    // For local dev, it's the current window.
    const targetWindow = window;

    // Run all analysis functions
    const overview = analyzeOverview(targetWindow);
    const headings = analyzeHeadings(targetWindow.document);
    const links = analyzeLinks(targetWindow);
    const images = analyzeImages(targetWindow);
    const schema = analyzeSchema(targetWindow.document);
    const social = analyzeSocial(targetWindow.document);
    const content = {
        keywords: analyzeKeywords(targetWindow.document)
    };

    analysisData = {
      overview,
      headings,
      links,
      images,
      schema,
      social,
      content,
    };

    isLoading = false;
    console.log('Analysis complete:', analysisData);
  });

  function handleTabClick(tabId) {
    activeTab = tabId;
  }
</script>

<div id="seo-checker-container">
  <header>
    <h1>SEO & Accessibility Checker</h1>
    <button id="close-btn" on:click={() => { /* Logic to close/remove the UI will be added later */ }}>&times;</button>
  </header>

  <main>
    <nav class="tabs">
      {#each tabs as tab}
        <button
          class:active={activeTab === tab.id}
          on:click={() => handleTabClick(tab.id)}
        >
          {tab.label}
        </button>
      {/each}
    </nav>

    <div class="tab-content">
      {#if isLoading}
        <p>Analyzing page...</p>
      {:else if analysisData}
        {#if activeTab === 'overview'}
          <Overview data={analysisData.overview} />
        {:else if activeTab === 'headings'}
          <Headings data={analysisData.headings} />
        {:else if activeTab === 'links'}
          <Links data={analysisData.links} />
        {:else if activeTab === 'images'}
          <Images data={analysisData.images} />
        {:else if activeTab === 'schema'}
          <Schema data={analysisData.schema} />
        {:else if activeTab === 'social'}
          <Social data={analysisData.social} />
        {:else if activeTab === 'content'}
          <Content data={analysisData.content} />
        {/if}
      {/if}
    </div>
  </main>
</div>

<style>
  /* Basic styling to make the UI usable. This will be improved. */
  #seo-checker-container {
    font-family: sans-serif;
    border: 1px solid #ccc;
    border-radius: 8px;
    background: white;
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    width: 400px;
    color: #333;
  }
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid #ccc;
  }
  h1 {
    font-size: 1.2em;
    margin: 0;
  }
  .tabs {
    display: flex;
    border-bottom: 1px solid #ccc;
  }
  .tabs button {
    padding: 10px 15px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 1em;
  }
  .tabs button.active {
    border-bottom: 3px solid #007bff;
    font-weight: bold;
  }
  .tab-content {
    padding: 15px;
  }
</style>
