<script>
  /**
   * @type {import('../analysis/social').analyzeSocial}
   */
  export let data;

  const ogTags = Object.entries(data.openGraph);
  const twitterTags = Object.entries(data.twitter);
</script>

<div class="grid">
    {#if ogTags.length > 0}
        <div class="card">
            <h3>Open Graph Tags</h3>
            <table>
                <tbody>
                {#each ogTags as [property, content]}
                    <tr>
                        <th>{property}</th>
                        <td>{content}</td>
                    </tr>
                {/each}
                </tbody>
            </table>
        </div>
    {/if}

    {#if twitterTags.length > 0}
        <div class="card">
            <h3>Twitter Card Tags</h3>
            <table>
                <tbody>
                 {#each twitterTags as [name, content]}
                    <tr>
                        <th>{name}</th>
                        <td>{content}</td>
                    </tr>
                {/each}
                </tbody>
            </table>
        </div>
    {/if}

    {#if ogTags.length === 0 && twitterTags.length === 0}
        <p>No social media tags (Open Graph or Twitter) were found.</p>
    {/if}
</div>

<style>
  .grid { display: grid; gap: 1rem; }
  .card { border: 1px solid #e0e0e0; border-radius: 6px; padding: 12px; }
  h3 { margin-top: 0; }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; padding: 4px; border-bottom: 1px solid #eee; word-break: break-all;}
  th { font-weight: bold; width: 150px; }
</style>
