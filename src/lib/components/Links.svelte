<script>
  /**
   * @type {import('../analysis/links').analyzeLinks}
   */
  export let data;

  function getStatusColor(count) {
    if (count > 0) return 'error';
    return 'good';
  }
</script>

<div class="grid">
  <div class="card summary-card">
    <h3>Link Summary</h3>
    <div class="summary-grid">
        <div>Total: {data.counts.total}</div>
        <div>Internal: {data.counts.internal}</div>
        <div>External: {data.counts.external}</div>
    </div>
  </div>

  <div class="card issues-card">
    <h3>Link Issues</h3>
    <div class="summary-grid">
        <div class="status-{getStatusColor(data.counts.broken)}">Broken: {data.counts.broken}</div>
        <div class="status-{getStatusColor(data.counts.insecure)}">Insecure: {data.counts.insecure}</div>
        <div class="status-{getStatusColor(data.counts.genericText)}">Generic Text: {data.counts.genericText}</div>
    </div>
  </div>

  {#if data.issues.broken.length > 0}
    <div class="card list-card">
      <h4>Broken Links</h4>
      <ul>
        {#each data.issues.broken as link}
          <li>{link.text} <span>(href: {link.href || 'missing'})</span></li>
        {/each}
      </ul>
    </div>
  {/if}

  {#if data.issues.insecure.length > 0}
    <div class="card list-card">
      <h4>Insecure Links (target="_blank" without rel="noopener")</h4>
      <ul>
        {#each data.issues.insecure as link}
          <li><a href={link.href} target="_blank" rel="noopener noreferrer">{link.text}</a></li>
        {/each}
      </ul>
    </div>
  {/if}
</div>

<style>
  .grid { display: grid; gap: 1rem; }
  .card { border: 1px solid #e0e0e0; border-radius: 6px; padding: 12px; }
  h3, h4 { margin-top: 0; }
  .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  ul { padding-left: 20px; margin: 0; }
  .status-good { color: #155724; }
  .status-error { color: #721c24; font-weight: bold; }
</style>
