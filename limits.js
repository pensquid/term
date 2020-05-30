const kb = 1024
const mb = kb * 1024

module.exports = {
  // prevent container from spawning more then 64 processes (mitigate fork bomb)
  Ulimits: [
    {Name: 'nproc', Soft: 64, Hard: 64}
  ],

  // cap cpu per container at 10% of one core
  NanoCpus: 1e8,

  // limit memory so they can't consume it all
  Memory: mb * 64,

  // so docker warned that this might be bad, but limits can't ever be bad!
  // I'm sure the kernel will be fine with running out of memory in the container,
  // there are zero things that could go wrong
  //
  // ZERO
  KernelMemory: mb * 64,
}
