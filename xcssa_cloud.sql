SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `file`;
CREATE TABLE `file` (
  `fid` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(255) COLLATE utf8_bin NOT NULL,
  `name` varchar(255) COLLATE utf8_bin NOT NULL,
  `ctime` datetime NOT NULL,
  `mtime` datetime NOT NULL,
  `filesize` double NOT NULL,
  `sha` varchar(255) COLLATE utf8_bin NOT NULL,
  `url` varchar(255) COLLATE utf8_bin NOT NULL,
  `dir` varchar(255) COLLATE utf8_bin NOT NULL,
  `sfid` varchar(255) COLLATE utf8_bin NOT NULL,
  `share` bit(1) NOT NULL,
  `password` varchar(255) COLLATE utf8_bin NOT NULL,
  `uid` int(11) NOT NULL,
  PRIMARY KEY (`fid`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `uid` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) COLLATE utf8_bin NOT NULL,
  `password` varchar(255) COLLATE utf8_bin NOT NULL,
  `email` varchar(255) COLLATE utf8_bin NOT NULL,
  `phone` varchar(255) COLLATE utf8_bin NOT NULL,
  `bucket` varchar(255) COLLATE utf8_bin NOT NULL,
  `s_space` varchar(255) COLLATE utf8_bin NOT NULL,
  `u_space` varchar(255) COLLATE utf8_bin NOT NULL,
  `level` int(11) NOT NULL,
  `purview` int(11) NOT NULL,
  `huajicurrency` int(11) NOT NULL,
  PRIMARY KEY (`uid`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
