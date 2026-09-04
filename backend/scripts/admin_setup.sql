-- Buat tabel users jika belum ada
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('Admin','Editor') DEFAULT 'Admin',
  `created_at` timestamp DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Hapus akun admin default jika sudah ada, agar tidak duplikat
DELETE FROM `users` WHERE `email` = 'admin@lisan';

-- Insert akun admin default (password: 123456)
INSERT INTO `users` (`name`, `email`, `password`, `role`) VALUES
('Admin Utama', 'admin@lisan', '$2b$10$Hj5Col471JDvmKenecRdW.WgXChZRoRP9ZvnKZd5aMj638m5GF5C.', 'Admin');
