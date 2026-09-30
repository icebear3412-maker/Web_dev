import type { Movie } from '@/services/movies';

const posterFiles = import.meta.glob<string>('/src/assets/movie/*.{jpg,jpeg,png,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
});

// Điền tên phim vào dấu nháy đơn, giữ nguyên tên file ở bên trái.
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

export const localMoviePosters: Movie[] = Object.entries(posterFiles)
  .sort(([pathA], [pathB]) => pathA.localeCompare(pathB))
  .map(([path, poster]) => {
    const filename = path.split('/').at(-1) ?? 'movie';
    const slug = filename.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return {
      id: `local-${slug}`,
      title: movieTitles[filename] ?? '',
      poster,
      status: 'showing',
    };
  });

export function getLocalMovie(movieId: string): Movie | undefined {
  return localMoviePosters.find((movie) => movie.id === movieId);
}
