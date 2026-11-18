type FileLaunchQueue = {
  setConsumer: (consumer: (launch: { files?: FileSystemFileHandle[] }) => void) => void;
};

export function listenForFileLaunches(onLaunch: (files: File[], unavailable: number) => Promise<void>) {
  const queue = (window as Window & { launchQueue?: FileLaunchQueue }).launchQueue;
  let pending = Promise.resolve();
  queue?.setConsumer(({ files }) => {
    if (!files?.length) return;
    pending = pending.catch(() => {}).then(async () => {
      const results = await Promise.allSettled(files.map(async handle => handle.getFile()));
      const readable = results.flatMap(result => result.status === 'fulfilled' ? [result.value] : []);
      await onLaunch(readable, files.length - readable.length);
    });
  });
}
