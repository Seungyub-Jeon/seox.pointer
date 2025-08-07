<script>
  /**
   * @type {import('../analysis/overview').analyzeOverview}
   */
  export let data;

  function getStatus(value, goodRanges, warnRanges = []) {
    if (goodRanges.some(([min, max]) => value >= min && value <= max)) {
      return 'good';
    }
    if (warnRanges.some(([min, max]) => value >= min && value <= max)) {
      return 'warning';
    }
    return 'error';
  }

  $: titleStatus = getStatus(data.title.length, [[10, 60]], [[61, 70]]);
  $: descriptionStatus = getStatus(data.description.length, [[50, 160]], [[161, 170]]);
</script>

<div class="overview-grid">
  <div class="card">
    <div class="card-header">
      <h3>Page Title</h3>
      <span class="status {titleStatus}">{data.title.length} chars</span>
    </div>
    <div class="card-body">
      <p>{data.title.text || '(Not found)'}</p>
    </div>
  </div>

  <div class="card">
    <div class="card-header">
      <h3>Meta Description</h3>
       <span class="status {descriptionStatus}">{data.description.length} chars</span>
    </div>
    <div class="card-body">
       <p>{data.description.text || '(Not found)'}</p>
    </div>
  </div>

  <div class="card">
    <div class="card-header">
        <h3>URL</h3>
        <span class="status {data.url.isIndexable ? 'good' : 'error'}">
            {data.url.isIndexable ? 'Indexable' : 'Not Indexable'}
        </span>
    </div>
    <div class="card-body">
        <p class="url-text">{data.url.href}</p>
        {#if data.url.robotsContent}
            <p><strong>Robots:</strong> <code>{data.url.robotsContent}</code></p>
        {/if}
    </div>
  </div>

  <div class="card">
    <div class="card-header">
        <h3>Canonical URL</h3>
        <span class="status {data.canonical.isSelfReferencing ? 'good' : 'warning'}">
            {data.canonical.isSelfReferencing ? 'Self-referencing' : 'Points Elsewhere'}
        </span>
    </div>
    <div class="card-body">
        <p class="url-text">{data.canonical.href || '(Not found)'}</p>
    </div>
  </div>
</div>

<style>
  .overview-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 15px;
  }
  .card {
    border: 1px solid #e0e0e0;
    border-radius: 6px;
  }
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #f7f7f7;
    padding: 8px 12px;
    border-bottom: 1px solid #e0e0e0;
  }
  h3 {
    margin: 0;
    font-size: 1em;
  }
  .card-body {
    padding: 12px;
    font-size: 0.9em;
    word-break: break-all;
  }
  .card-body p {
    margin: 0;
  }
  .url-text {
    font-family: monospace;
    font-size: 0.85em;
  }
  .status {
    padding: 3px 8px;
    border-radius: 12px;
    font-size: 0.8em;
    font-weight: bold;
  }
  .status.good {
    background-color: #d4edda;
    color: #155724;
  }
  .status.warning {
    background-color: #fff3cd;
    color: #856404;
  }
  .status.error {
    background-color: #f8d7da;
    color: #721c24;
  }
</style>
