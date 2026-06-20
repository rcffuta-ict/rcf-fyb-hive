export function readLocalStorage(key: string) {
    const data = localStorage.getItem(key)

    // console.log("Data:", key, data);
    return data;
}

export function updateLocalStorage(key: string, value: string) {
    localStorage.setItem(key, value)    
}
