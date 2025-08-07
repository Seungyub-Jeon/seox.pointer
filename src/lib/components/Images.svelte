<script>
  /**
   * @type {import('../analysis/images').analyzeImages}
   */
  export let data;
</script>

<div class="grid">
  <div class="card">
    <h3>Image Summary</h3>
    <p>Total Images: {data.counts.total}</p>
  </div>

  <div class="card">
    <h3>Image Issues</h3>
    <ul>
      <li>Missing Alt Text: {data.counts.missingAlt}</li>
      <li>Long Alt Text: {data.counts.longAlt}</li>
      <li>Missing Dimensions: {data.counts.missingDimensions}</li>
    </ul>
  </div>

  {#if data.issues.missingAlt.length > 0}
    <div class="card list-card">
        <h4>Images Missing Alt Text</h4>
        <ul>
            {#each data.issues.missingAlt as src}
                <li>{src}</li>
            {/each}
        </ul>
    </div>
  {/if}
</div>

<style>
  .grid { display: grid; gap: 1rem; }
  .card { border: 1px solid #e0e0e0; border-radius: 6px; padding: 12px; }
  h3 { margin-top: 0; }
  ul { padding-left: 20px; margin: 0; }
</style>
