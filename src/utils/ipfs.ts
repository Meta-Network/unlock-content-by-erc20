import axios from "axios";
import FormData from "form-data";

export async function uploadToPublic(file: any) {
    console.info('uploadToPublic start')
    const fd = new FormData();
    fd.append('file', file);
    const { data } = await axios.post<{
        "Name": string;
        "Hash": string;
        "Size": string;
    }>(
        'https://ipfs.infura.io:5001/api/v0/add',
        fd,
        {
            headers: fd.getHeaders(),
            timeout: 1000 * 15,
            params: { pin: 'true' },
        }
    );
    return data.Hash
}