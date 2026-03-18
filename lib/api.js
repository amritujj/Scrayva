export const fetchWorkerStatus = async () => {
  try {
    const res = await fetch('/api/worker-status');
    return await res.json();
  } catch (error) {
    console.error("Error fetching worker status API proxy:", error);
    return { status: 'error' };
  }
};

export const fetchTasksProxy = async () => {
  try {
    const res = await fetch('/api/tasks');
    return await res.json();
  } catch (error) {
    console.error("Error fetching tasks API proxy:", error);
    return [];
  }
};
