import type { Movie } from '@/services/movies';

const posterFiles = import.meta.glob<string>('/src/assets/movie/*.{jpg,jpeg,png,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
});

export const movieTitles: Record<string, string> = {
  'encore_alt_1sht_-_rgb_online_only.jpg': 'AVENGERS: HỒI KẾT - PHIÊN BẢN ĐẶC BIỆT (CHIẾU LẠI)',
  '350x495-chiikawa.jpg': 'CHIIKAWA: BÍ MẬT ĐẢO NGƯỜI CÁ',
  '350x495-tbn.jpg': 'TRẠI BUÔN NGƯỜI',
  '470wx700h-lh.jpg': 'LÊN HƯƠNG',
  '470wx700h-shin.jpg': 'PHIM SHIN – CẬU BÉ BÚT CHÌ: KỲ KỲ QUÁI QUÁI! KỲ NGHỈ YÊU QUÁI CỦA TỚ',
  '470x700-dawn.jpg': 'PHÁO HOA LÚC BÌNH MINH',
  '470x700-demon.jpg': 'YÊU NHÂN THẦN THÁM: KỲ ÁN TRƯỜNG AN',
  '470x700-residentevil_1.jpg': 'VÙNG ĐẤT QUỶ DỮ',
  'fid_trio_470x700.jpg': 'HÒN ĐẢO QUÊN LÃNG',
  'hop_mainposter_470x700.jpg': 'HOPE VÙNG TỬ ĐỊA',
  'is6_intl_online_1080x1350_tsr_bluehands_02_1_.jpg': 'QUỶ QUYỆT: RANH GIỚI VÔ ĐỊNH',
  'outlined_poster_castle-in-the-sky.jpg': 'LAPUTA: LÂU ĐÀI TRÊN KHÔNG',
  'outlined_poster_when-marnie-was-there.jpg': 'MARNIE YÊU DẤU',
  'TheOdyssey.jpg': 'THE ODYSSEY',
};

// Điền link trailer YouTube cho từng phim; hỗ trợ link watch, youtu.be hoặc video ID.
export const movieTrailers: Record<string, string> = {
  '350x495-chiikawa.jpg': 'https://youtu.be/8LJm14u1o-E?si=6NPtOpisyDrP1vO4',
  '350x495-tbn.jpg': 'https://youtu.be/xGiimAKN0TM?si=PQbYP2xyeZ0tH7Vb',
  '470wx700h-lh.jpg': 'https://youtu.be/tMu23yKJ9_c?si=tVX54tz5QWL4eBaJ',
  '470wx700h-shin.jpg': 'https://youtu.be/jBFzXQQ4aR4?si=2nbDbhigx8i29-bS',
  '470x700-dawn.jpg': '',
  '470x700-demon.jpg': 'https://youtu.be/-f9pxNdJ8K8?si=BtlmGXHrgAVAx5Jx',
  '470x700-residentevil_1.jpg': 'https://youtu.be/GWWJrOYzJZY?si=HXsFz0XEz01wcyaW',
  'encore_alt_1sht_-_rgb_online_only.jpg': 'https://youtu.be/XsDQf4EsZIs?si=tFLdPU41A7jyf14m',
  'fid_trio_470x700.jpg': '',
  'hop_mainposter_470x700.jpg': 'https://youtu.be/WjcyzHQkumU?si=plJux-mJBIrJyNcy',
  'is6_intl_online_1080x1350_tsr_bluehands_02_1_.jpg':
    'https://youtu.be/PwX6QDl8dTU?si=PKhty3Ejc6Gl2rjB',
  'outlined_poster_castle-in-the-sky.jpg': 'https://youtu.be/0P8vhBmiA14?si=bDJX7St4hDKalXVi',
  'outlined_poster_when-marnie-was-there.jpg': 'https://youtu.be/g3KES9FASh8?si=ivQFHvkAFAfhoBfp',
  'TheOdyssey.jpg': 'https://youtu.be/vRYJwJIdpjs?si=I1h7-G9rh5OZk6Q-',
};

export const localMoviePosters: Movie[] = Object.entries(posterFiles)
  .sort(([pathA], [pathB]) => pathA.localeCompare(pathB))
  .map(([path, poster]) => {
    const filename = path.split('/').at(-1) ?? 'movie';
    const slug = filename
      .replace(/\.[^.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    return {
      id: `local-${slug}`,
      title: movieTitles[filename] ?? '',
      trailer_url: movieTrailers[filename] ?? '',
      poster,
      status: 'showing',
    };
  });

export function getLocalMovie(movieId: string): Movie | undefined {
  return localMoviePosters.find((movie) => movie.id === movieId);
}
