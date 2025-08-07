<script>
  /**
   * @type {import('../analysis/headings').analyzeHeadings}
   */
  export let data;

  $: h1Status = data.h1.count === 1 ? 'good' : 'error';
</script>

<div class="headings-grid">
  <div class="card">
    <div class="card-header">
      <h3>H1 Tag</h3>
      <span class="status {h1Status}">{data.h1.count} found</span>
    </div>
    <div class="card-body">
      {#if data.h1.count > 0}
        <p><strong>Content:</strong> {data.h1.text}</p>
      {:else}
        <p>No H1 tag was found on the page.</p>
      {/if}
    </div>
  </div>

  <div class="card">
    <div class="card-header">
      <h3>Headings Outline</h3>
    </div>
    <div class="card-body">
      {#if data.headings.length > 0}
        <ul class="headings-list">
          {#each data.headings as heading}
            <li class="level-{heading.level}">
              <span class="tag">H{heading.level}</span>
              <span class="text">{heading.text || '(empty)'}</span>
              {#if heading.issues.length > 0}
                <span class="issue">({heading.issues.join(', ')})</span>
              {/if}
            </li>
          {/each}
        </ul>
      {:else}
        <p>No headings found.</p>
      {/if}
    </div>
  </div>
</div>

<style>
  .headings-grid {
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
  }
  .headings-list {
    list-style: none;
    padding: 0;
    margin: 0;
    font-family: monospace;
  }
  .headings-list li {
    margin-bottom: 4px;
    display: flex;
    align-items: center;
  }
  .tag {
    font-weight: bold;
    margin-right: 8px;
    color: #007bff;
  }
  .issue {
    margin-left: 8px;
    color: #dc3545;
    font-size: 0.8em;
  }
  /* Indentation for hierarchy */
  .level-2 { padding-left: 20px; }
  .level-3 { padding-left: 40px; }
  .level-4 { padding-left: 60px; }
  .level-5 { padding-left: 80px; }
  .level-6 { padding-left: 100px; }

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
  .status.error {
    background-color: #f8d7da;
    color: #721c24;
  }
</style>
