const kb = 1024
const mb = kb * 1024

module.exports = {
  HostConfig: {
    // prevent container from spawning more then 64 processes (mitigate fork bomb)
    Ulimits: [
      {Name: 'nproc', Soft: 64, Hard: 64}
    ],

    // cap cpu per container at 10% of one core
    NanoCpus: 1e8,

    // limit memory so they can't consume it all
    Memory: mb * 64,
  }
}
