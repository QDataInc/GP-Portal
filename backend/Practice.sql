CREATE TABLE Students (
    id INT PRIMARY KEY,
    name VARCHAR(50),
    age INT,
    grade VARCHAR(5)
);

INSERT INTO Students VALUES
(1, 'Alice', 14, 'A'),
(2, 'Brian', 15, 'B'),
(3, 'Cindy', 14, 'A'),
(4, 'David', 16, 'C');

INSERT INTO Scores VALUES
(101, 1, 'Math', 92),
(102, 1, 'Science', 88),
(103, 2, 'Math', 73),
(104, 3, 'Math', 95),
(105, 4, 'Science', 60);

--basic
select * from Students;
select name, age from Students;
SELECT * FROM Students WHERE grade = 'A';
SELECT * FROM Students WHERE age BETWEEN 14 AND 15;
SELECT * FROM Students WHERE name LIKE 'A%';   -- starts with A
SELECT * FROM Students WHERE name LIKE '%n';   -- ends with n
select name,age,grade from Students order by 2;
select * from students order by age asc;

/*
=	equal
<> or !=	not equal
>, <, >=, <=	comparisons
BETWEEN	range
IN (…)	matches any
NOT IN (…)	excludes
LIKE	pattern search
IS NULL	null check
*/

select distinct grade from Students

select name as student_name from Students --colum_alias
SELECT s.name from Students s

SELECT * from Students LIMIT 1

/*
COUNT()	count rows
SUM()	sum of numbers
AVG()	average
MIN()	minimum
MAX()	maximum
*/

SELECT count(*)  from students
SELECT AVG(marks) FROM Scores;

select subject, avg(marks) from scores group by subject having Avg(marks) > 75 order by marks desc
select subject, avg(marks) from scores group by subject order by marks desc

---with average



