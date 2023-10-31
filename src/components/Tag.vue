<template>
  <div>
    <button
      :class="[{ 'opacity-40': blur }, returnClass(type),'px-1.5 h-6 text-sm font-semibold tracking-wide uppercase rounded select-none transition flex justify-center items-center cursor-pointer']"
    >
      <span>{{ type || 'unknown' }}</span>
      <span v-if="number" class="ml-1 opacity-60">({{ number }})</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'unknown'
  },
  number: Number | String,
  blur: Boolean
});

const returnClass = (type) => {
  switch (type) {
    case "png":
      return "bg-green-200 text-green-900";
    case "jpeg":
      return "bg-sky-200 text-sky-900";
    case "svg":
      return "bg-orange-200 text-orange-900";
    case "webp":
      return "bg-pink-200 text-pink-900";
    case "ico":
      return "bg-yellow-200 text-yellow-900";
    case "gif":
      return "bg-purple-200 text-purple-900";
    default:
      return "bg-gray-200 text-gray-900";
  }
};
</script>