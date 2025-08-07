<script>
  /**
   * @type {import('../analysis/schema').analyzeSchema}
   */
  export let data;
</script>

<div class="grid">
    <div class="card">
        <h3>Schema Summary</h3>
        <p>Total Items Found: {data.counts.total}</p>
        <ul>
            <li>JSON-LD: {data.counts.jsonLD}</li>
            <li>Microdata: {data.counts.microdata}</li>
            <li>RDFa: {data.counts.rdfa}</li>
        </ul>
    </div>

    {#if data.counts.total > 0}
        <div class="card">
            <h3>Schema Types</h3>
            <ul>
                {#each Object.entries(data.schemaTypes) as [type, count]}
                    <li>{type}: {count}</li>
                {/each}
            </ul>
        </div>

        {#if data.counts.jsonLD > 0}
            <div class="card">
                <h4>JSON-LD Data</h4>
                {#each data.jsonLD as item}
                    <pre>{JSON.stringify(item, null, 2)}</pre>
                {/each}
            </div>
        {/if}
    {/if}
</div>

<style>
  .grid { display: grid; gap: 1rem; }
  .card { border: 1px solid #e0e0e0; border-radius: 6px; padding: 12px; }
  h3, h4 { margin-top: 0; }
  ul { padding-left: 20px; margin: 0; }
  pre {
    background-color: #f4f4f4;
    padding: 10px;
    border-radius: 4px;
    white-space: pre-wrap;
    word-break: break-all;
    font-size: 0.8em;
   }
</style>
