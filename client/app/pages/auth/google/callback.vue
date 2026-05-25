<template>
  <div />
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

onMounted(() => {
  const hash = window.location.hash.substring(1)
  const params = new URLSearchParams(hash)
  const idToken = params.get('id_token')

  if (idToken) {
    const bc = new BroadcastChannel('google_auth')
    bc.postMessage({ type: 'google_auth', idToken })
    bc.close()
  }
  window.close()
})
</script>
