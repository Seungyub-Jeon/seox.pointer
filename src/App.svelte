<script>
  import { onMount, onDestroy } from 'svelte';
  // Import all our new analysis modules
  import { analyzeOverview } from './lib/analysis/overview.js';
  import { analyzeHeadings } from './lib/analysis/headings.js';
  import { analyzeLinks } from './lib/analysis/links.js';
  import { analyzeImages } from './lib/analysis/images.js';
  import { analyzeSchema } from './lib/analysis/schema.js';
  import { analyzeSocial } from './lib/analysis/social.js';
  import { analyzeKeywords } from './lib/analysis/content.js';

  // Import Components
  import Overview from './lib/components/Overview.svelte';
  import Headings from './lib/components/Headings.svelte';
  import Links from './lib/components/Links.svelte';
  import Images from './lib/components/Images.svelte';
  import Schema from './lib/components/Schema.svelte';
  import Social from './lib/components/Social.svelte';
  import Content from './lib/components/Content.svelte';

  // --- State ---
  let analysisData = {};
  let activeTab = 'overview';
  let isLoading = true;
  let loadedTabs = new Set();

  export let hostElement; // The component will be passed the host element to remove itself

  const tabs = [
    { id: 'overview', label: 'Overview', analysis: (win) => analyzeOverview(win) },
    { id: 'headings', label: 'Headings', analysis: (win) => analyzeHeadings(win.document) },
    { id: 'links', label: 'Links', analysis: (win) => analyzeLinks(win) },
    { id: 'images', label: 'Images', analysis: (win) => analyzeImages(win) },
    { id: 'schema', label: 'Schema', analysis: (win) => analyzeSchema(win.document) },
    { id: 'social', label: 'Social', analysis: (win) => analyzeSocial(win.document) },
    { id: 'content', label: 'Content', analysis: (win) => ({ keywords: analyzeKeywords(win.document) }) },
  ];

  // --- Lifecycle & Methods ---
  onMount(() => {
    runAnalysisForTab('overview');
  });

  async function runAnalysisForTab(tabId) {
    if (loadedTabs.has(tabId)) return; // Don't re-run analysis

    isLoading = true;
    const tab = tabs.find(t => t.id === tabId);
    if (tab && tab.analysis) {
      // Use a timeout to allow the "Loading..." message to render
      setTimeout(() => {
        const targetWindow = window;
        const results = tab.analysis(targetWindow);
        analysisData = {
          ...analysisData,
          [tabId]: results
        };
        loadedTabs.add(tabId);
        isLoading = false;
        console.log(`Analysis complete for ${tabId}:`, results);
      }, 50);
    }
  }

  function handleTabClick(tabId) {
    activeTab = tabId;
    runAnalysisForTab(tabId);
  }

  function handleClose() {
    if (hostElement) {
      hostElement.remove();
    }
  }
</script>

<div id="seo-checker-container">
  <header>
    <h1>SEO & Accessibility Checker</h1>
    <button id="close-btn" on:click={handleClose}>&times;</button>
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
      {#if !loadedTabs.has(activeTab) || isLoading}
        <p>Analyzing page...</p>
      {:else if analysisData[activeTab]}
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
      {:else}
        <p>Could not retrieve data for this tab.</p>
      {/if}
    </div>
  </main>
</div>

<style>
  :global(*) {
    /* A very basic reset inside the shadow DOM */
    box-sizing: border-box;
  }
  /* Ensure the UI is fixed on top of the page */
  #seo-checker-container {
    position: fixed;
    top: 20px;
    left: 20px;
    width: 800px;
    max-height: 90vh;
    z-index: 2147483647; /* Max z-index */

    display: flex;
    flex-direction: column;

    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    border: 1px solid #ccc;
    border-radius: 8px;
    background: #ffffff;
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    color: #2d2d2d;
  }
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid #ddd;
    cursor: move; /* Allows dragging */
  }
  h1 {
    font-size: 1.1em;
    margin: 0;
  }
  #close-btn {
    font-size: 1.5em;
    background: transparent;
    border: none;
    cursor: pointer;
  }
  .tabs {
    display: flex;
    flex-wrap: wrap;
    border-bottom: 1px solid #ddd;
    background-color: #f9f9f9;
  }
  .tabs button {
    padding: 10px 15px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 0.9em;
    color: #555;
  }
  .tabs button.active {
    border-bottom: 3px solid #007bff;
    font-weight: bold;
    color: #000;
  }
  .tab-content {
    padding: 15px;
    overflow-y: auto;
    flex-grow: 1;
  }
</style>
