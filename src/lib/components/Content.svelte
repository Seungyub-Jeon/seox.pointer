<script>
  /**
   * @type {{keywords: [string, number][]}}
   */
  export let data;
</script>

<div class="grid">
    <div class="card">
        <h3>Top Keywords</h3>
        {#if data.keywords.length > 0}
            <ol>
                {#each data.keywords as [word, count]}
                    <li>{word} ({count})</li>
                {/each}
            </ol>
        {:else}
            <p>No significant keywords found.</p>
        {/if}
    </div>
</div>

<style>
  .grid { display: grid; gap: 1rem; }
  .card { border: 1px solid #e0e0e0; border-radius: 6px; padding: 12px; }
  h3 { margin-top: 0; }
  ol { padding-left: 20px; margin: 0; }
</style>
